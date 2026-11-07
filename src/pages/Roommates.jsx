import React, { useState, useEffect, useMemo } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import defaultUser from "../img/profile/user.jpg";
import { Wheel } from "react-custom-roulette";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const matchCategories = [
  { key: "cleanliness", ids: ["1", "2", "3"], icon: "🧹" },
  { key: "routine", ids: ["4", "5", "6"], icon: "⏰" },
  { key: "social", ids: ["7", "8", "9"], icon: "🍕" },
  { key: "rules", ids: ["10", "11", "12"], icon: "🤝" },
  { key: "comfort", ids: ["13", "14", "15"], icon: "🛋️" },
];

/* ---------- Класи (перенесено з roommate.scss) ---------- */
const colHalf = "w-full text-left lg:w-[calc(50%-12px)]";
const colCandidate =
  "w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]";

const pageTitleCls =
  "mb-2 text-[length:calc(1.3rem+0.6vw)] font-bold text-white xl:text-[1.75rem]";

const tabBase =
  "cursor-pointer rounded-full border-none px-6 py-2 text-[13.5px] font-semibold transition-all duration-200 ";
const tabActive = "bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.4)]";
const tabIdle = "bg-transparent text-fg-secondary hover:text-white";

const blockCls =
  "overflow-hidden rounded-2xl border border-line bg-card shadow-[0_4px_20px_rgba(0,0,0,0.4)]";
const toggleHeaderCls =
  "flex cursor-pointer select-none items-center justify-between px-5 py-4";
const blockTitleCls = "text-[15px] font-semibold text-white";
const toggleBtnCls =
  "flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border border-line bg-page " +
  "text-fg-secondary transition-all duration-150 hover:border-[#525252] hover:text-white";

const inputCls =
  "rounded-lg border border-line bg-page px-3 py-[9px] text-[13.5px] text-white outline-none " +
  "transition-colors duration-150 placeholder:text-[#525252] focus:border-[#525252]";

const dropdownCls =
  "absolute left-0 top-full z-[1000] mt-1.5 max-h-[200px] w-full overflow-y-auto rounded-[10px] border " +
  "border-line-focus bg-[#161616] shadow-[0_10px_25px_rgba(0,0,0,0.6)]";
const dropdownItemCls =
  "flex cursor-pointer items-center border-b border-white/5 px-3.5 py-2.5 transition-colors duration-150 " +
  "last:border-b-0 hover:bg-[#222222]";

const tagPillCls =
  "inline-flex items-center rounded-full border border-line bg-page px-3 py-1.5 text-[13px] text-fg";
const tagCloseCls =
  "bi bi-x ml-2 cursor-pointer text-sm text-[#737373] transition-colors duration-150 hover:text-[#ef4444]";

const spinBtnCls =
  "w-full cursor-pointer rounded-[10px] border border-white bg-white text-[15px] font-bold text-black " +
  "transition-all duration-200 enabled:hover:border-[#e5e5e5] enabled:hover:bg-[#e5e5e5] " +
  "disabled:cursor-not-allowed disabled:opacity-40";

const compatBase =
  "flex h-[38px] w-[38px] cursor-help items-center justify-center rounded-full border text-base " +
  "transition-transform duration-150 hover:scale-[1.15] ";
const compatGreen = "border-[#10b981]/35 bg-[#10b981]/15";
const compatRed = "border-[#ef4444]/35 bg-[#ef4444]/15";

const Roommates = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentUserData, setCurrentUserData] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [myFriends, setMyFriends] = useState([]);

  const [currentUserAnswers, setCurrentUserAnswers] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const [activeTab, setActiveTab] = useState("room");
  const [isRoommatesOpen, setIsRoommatesOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [searchFriendTerm, setSearchFriendTerm] = useState("");
  const [newTask, setNewTask] = useState("");

  const [spinStage, setSpinStage] = useState("task");
  const [selectedTask, setSelectedTask] = useState(null);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState(null);

  // Динамічний розмір колеса для телефонів та ПК
  const [wheelSize, setWheelSize] = useState(380);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 420) {
        setWheelSize(280);
      } else if (screenWidth < 768) {
        setWheelSize(320);
      } else {
        setWheelSize(380);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentUserData({ id: user.uid, ...data });

        if (data.tasks) setTasks(data.tasks);
        if (data.answers) setCurrentUserAnswers(data.answers);

        if (data.friends && data.friends.length > 0) {
          const friendsData = await Promise.all(
            data.friends.map(async (friendId) => {
              const fSnap = await getDoc(doc(db, "users", friendId));
              return { id: fSnap.id, ...fSnap.data() };
            }),
          );
          setMyFriends(friendsData);
        } else {
          setMyFriends([]);
        }

        if (data.roommates && data.roommates.length > 0) {
          const roommatesData = await Promise.all(
            data.roommates.map(async (rmId) => {
              const rSnap = await getDoc(doc(db, "users", rmId));
              return { id: rSnap.id, ...rSnap.data() };
            }),
          );
          setRoommates(roommatesData);
        } else {
          setRoommates([]);
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (activeTab === "search" && currentUserAnswers) {
      const fetchMatches = async () => {
        setIsLoadingMatches(true);
        try {
          const q = query(
            collection(db, "users"),
            where("hasPassedTest", "==", true),
          );
          const snapshot = await getDocs(q);
          const usersList = [];
          snapshot.forEach((docSnap) => {
            if (docSnap.id !== user.uid) {
              usersList.push({ id: docSnap.id, ...docSnap.data() });
            }
          });
          setPotentialMatches(usersList);
        } catch (error) {
          console.error("Помилка завантаження:", error);
        } finally {
          setIsLoadingMatches(false);
        }
      };
      fetchMatches();
    }
  }, [activeTab, currentUserAnswers, user]);

  const calculateBlockStatus = (myAnswers, theirAnswers, questionIds) => {
    if (!myAnswers || !theirAnswers) return "red";
    let matchCount = 0;
    questionIds.forEach((id) => {
      if (
        myAnswers[id] &&
        theirAnswers[id] &&
        myAnswers[id] === theirAnswers[id]
      ) {
        matchCount++;
      }
    });
    return matchCount >= 2 ? "green" : "red";
  };

  const filteredFriends = myFriends.filter(
    (friend) =>
      friend.firstName
        ?.toLowerCase()
        .includes(searchFriendTerm.toLowerCase()) &&
      !roommates.some((rm) => rm.id === friend.id),
  );

  const handleAddRoommate = async (friendId) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        roommates: arrayUnion(friendId),
      });
      setSearchFriendTerm("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteRoommate = async (friendId) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        roommates: arrayRemove(friendId),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        tasks: arrayUnion(newTask.trim()),
      });
      setNewTask("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskText) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        tasks: arrayRemove(taskText),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const allParticipants = useMemo(() => {
    return currentUserData ? [currentUserData, ...roommates] : roommates;
  }, [currentUserData, roommates]);

  const wheelData = useMemo(() => {
    if (spinStage === "person") {
      if (allParticipants.length === 0) {
        return [
          { option: t("roommates.wheelAddRoommates") },
          { option: t("roommates.wheelAddRoommates") },
        ];
      }
      const mapped = allParticipants.map((p) => ({
        option:
          p.id === user.uid
            ? `${p.firstName} (${t("roommates.you")})`
            : p.firstName,
      }));
      return mapped.length === 1 ? [...mapped, ...mapped] : mapped;
    }

    if (tasks.length === 0) {
      return [
        { option: t("roommates.wheelAddTasks") },
        { option: t("roommates.wheelAddTasks") },
      ];
    }
    const mappedTasks = tasks.map((t) => ({ option: t }));
    return mappedTasks.length === 1
      ? [...mappedTasks, ...mappedTasks]
      : mappedTasks;
  }, [spinStage, allParticipants, tasks, user, t]);

  const handleSpinClick = () => {
    if (tasks.length === 0 || allParticipants.length === 0 || mustSpin) return;
    setWinner(null);
    setSelectedTask(null);
    setSpinStage("task");
    const targetIndex = Math.floor(Math.random() * wheelData.length);
    setPrizeNumber(targetIndex);
    setMustSpin(true);
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    if (spinStage === "task") {
      const chosenTask = wheelData[prizeNumber]?.option || tasks[0];
      setSelectedTask(chosenTask);

      setTimeout(() => {
        setSpinStage("person");
        setTimeout(() => {
          const personDataLength =
            allParticipants.length === 1
              ? 2
              : Math.max(allParticipants.length, 2);
          const nextIndex = Math.floor(Math.random() * personDataLength);
          setPrizeNumber(nextIndex);
          setMustSpin(true);
        }, 150);
      }, 700);
    } else if (spinStage === "person") {
      const actualIndex = prizeNumber % Math.max(allParticipants.length, 1);
      const chosenPerson = allParticipants[actualIndex] || allParticipants[0];

      setWinner({
        person: chosenPerson,
        task: selectedTask,
      });
      setSpinStage("task");
    }
  };

  return (
    <main className="min-h-screen bg-page pb-[60px] text-fg">
      <div className="mb-6 flex justify-center pt-6">
        <div className="inline-flex gap-1 rounded-full border border-line bg-card p-1">
          <button
            onClick={() => setActiveTab("room")}
            className={tabBase + (activeTab === "room" ? tabActive : tabIdle)}
          >
            {t("roommates.tabRoom")}
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={tabBase + (activeTab === "search" ? tabActive : tabIdle)}
          >
            {t("roommates.tabSearch")}
          </button>
        </div>
      </div>

      {activeTab === "room" && (
        <div className="mx-auto w-full max-w-[1140px] px-4 text-center">
          <h1 className={pageTitleCls}>{t("roommates.roomTitle")}</h1>
          <p className="mb-12 text-sm text-[#6c757d]">
            {t("roommates.roomSubtitle")}
          </p>

          <div className="mx-auto mb-12 flex max-w-[1100px] flex-wrap justify-center gap-6">
            {/* Блок сусідів */}
            <div className={colHalf}>
              <section className={blockCls}>
                <div
                  className={toggleHeaderCls}
                  onClick={() => setIsRoommatesOpen(!isRoommatesOpen)}
                >
                  <span className={blockTitleCls}>
                    {t("roommates.roommatesHeader")} ({roommates.length})
                  </span>
                  <button type="button" className={toggleBtnCls}>
                    <i
                      className={`bi ${isRoommatesOpen ? "bi-dash" : "bi-plus"}`}
                    ></i>
                  </button>
                </div>

                <div
                  className="grid"
                  style={{
                    gridTemplateRows: isRoommatesOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.25s ease",
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5">
                      <div className="relative mb-4">
                        <input
                          type="text"
                          className={`${inputCls} w-full`}
                          placeholder={t("roommates.searchFriendPlaceholder")}
                          value={searchFriendTerm}
                          onChange={(e) => setSearchFriendTerm(e.target.value)}
                        />
                        {searchFriendTerm.length > 0 && (
                          <div className={dropdownCls}>
                            {filteredFriends.length > 0 ? (
                              filteredFriends.map((friend) => (
                                <div
                                  key={friend.id}
                                  className={dropdownItemCls}
                                  onClick={() => handleAddRoommate(friend.id)}
                                >
                                  <img
                                    src={friend.avatar || defaultUser}
                                    alt="avatar"
                                    className="mr-2 h-[26px] w-[26px] rounded-full object-cover"
                                  />
                                  <span className="text-sm font-semibold text-white">
                                    {friend.firstName} {friend.lastName}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-[#6c757d]">
                                {t("roommates.noFriendsFound")}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {roommates.length === 0 && (
                          <p className="mb-0 text-sm text-[#6c757d]">
                            {t("roommates.noRoommatesAdded")}
                          </p>
                        )}
                        {roommates.map((rm) => (
                          <div key={rm.id} className={tagPillCls}>
                            <img
                              src={rm.avatar || defaultUser}
                              alt="avatar"
                              className="mr-2 h-5 w-5 rounded-full object-cover"
                            />
                            <span>{rm.firstName}</span>
                            <i
                              className={tagCloseCls}
                              onClick={() => handleDeleteRoommate(rm.id)}
                            ></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Блок завдань */}
            <div className={colHalf}>
              <section className={blockCls}>
                <div
                  className={toggleHeaderCls}
                  onClick={() => setIsTasksOpen(!isTasksOpen)}
                >
                  <span className={blockTitleCls}>
                    {t("roommates.tasksHeader")} ({tasks.length})
                  </span>
                  <button type="button" className={toggleBtnCls}>
                    <i
                      className={`bi ${isTasksOpen ? "bi-dash" : "bi-plus"}`}
                    ></i>
                  </button>
                </div>

                <div
                  className="grid"
                  style={{
                    gridTemplateRows: isTasksOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.25s ease",
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5">
                      <div className="mb-4 flex">
                        <input
                          type="text"
                          className={`${inputCls} min-w-0 grow rounded-[8px_0_0_8px]`}
                          placeholder={t("roommates.newTaskPlaceholder")}
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddTask()
                          }
                        />
                        <button
                          className="cursor-pointer rounded-[0_8px_8px_0] border-none bg-white px-4 font-semibold text-black transition-colors duration-150 hover:bg-[#e5e5e5]"
                          onClick={handleAddTask}
                        >
                          +
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {tasks.length === 0 && (
                          <p className="mb-0 text-sm text-[#6c757d]">
                            {t("roommates.noTasks")}
                          </p>
                        )}
                        {tasks.map((task, index) => (
                          <div key={index} className={tagPillCls}>
                            <span>{task}</span>
                            <i
                              className={tagCloseCls}
                              onClick={() => handleDeleteTask(task)}
                            ></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Колесо фортуни та панель керування */}
          <div className="mx-auto mt-2.5 flex max-w-[950px] flex-col items-center justify-center gap-10 lg:mt-5 lg:flex-row lg:gap-[60px]">
            <div className="flex shrink-0 items-center justify-center overflow-hidden">
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                backgroundColors={
                  spinStage === "person"
                    ? ["#1a1a1a", "#262626", "#333333", "#404040"]
                    : ["#6930c3", "#5390d9", "#48bfe3", "#64dfdf"]
                }
                textColors={["#ffffff"]}
                outerBorderColor="#262626"
                outerBorderWidth={6}
                innerBorderColor="#121212"
                innerBorderWidth={14}
                innerRadius={15}
                radiusLineColor="#262626"
                radiusLineWidth={1}
                fontSize={wheelSize < 340 ? 11 : 13}
                onStopSpinning={handleStopSpinning}
              />
            </div>

            <div className="w-full max-w-[420px] rounded-2xl border border-line bg-card p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              {selectedTask && (
                <div className="mb-4 rounded-[10px] border border-accent-purple/30 bg-accent-purple/[0.12] px-4 py-3">
                  <span className="mb-1 block text-sm text-[#6c757d]">
                    {t("roommates.selectedTaskLabel")}
                  </span>
                  <strong className="text-base text-white">
                    {selectedTask}
                  </strong>
                </div>
              )}

              <div className="mb-2 text-sm text-[#6c757d]">
                {t("roommates.roomParticipants")}
              </div>
              <div className="mb-6 flex flex-wrap gap-2">
                {allParticipants.map((p) => (
                  <span key={p.id} className={tagPillCls}>
                    {p.firstName}{" "}
                    {p.id === user?.uid && `(${t("roommates.you")})`}
                  </span>
                ))}
              </div>

              <button
                className={`${spinBtnCls} h-12`}
                disabled={
                  allParticipants.length === 0 || tasks.length === 0 || mustSpin
                }
                onClick={handleSpinClick}
              >
                {mustSpin
                  ? spinStage === "task"
                    ? t("roommates.spinningTask")
                    : t("roommates.spinningPerson")
                  : t("roommates.spinBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка переможця */}
      {winner && !mustSpin && (
        <div
          className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 p-4 backdrop-blur-[8px]"
          onClick={() => setWinner(null)}
        >
          <div
            className="w-full max-w-[400px] animate-modal-fade-in rounded-2xl border border-line-focus bg-card px-6 py-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-[2.5rem]">🎯</div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              {t("roommates.winnerTitle", { name: winner?.person?.firstName })}
            </h2>
            <p className="mb-6 text-[#6c757d]">
              {t("roommates.winnerTask")}{" "}
              <span className="font-semibold text-accent-mint">
                {winner?.task}
              </span>
            </p>
            <button
              className={`${spinBtnCls} h-[42px]`}
              onClick={() => {
                setWinner(null);
                setSelectedTask(null);
              }}
            >
              {t("roommates.modalGotIt")}
            </button>
          </div>
        </div>
      )}

      {/* Вкладка Пошук */}
      {activeTab === "search" && (
        <div className="mx-auto mt-2 w-full max-w-[1140px] px-4">
          <div className="mb-12 text-center">
            <h1 className={pageTitleCls}>{t("roommates.searchTitle")}</h1>
            <p className="m-0 text-sm text-[#6c757d]">
              {t("roommates.searchSubtitle")}
            </p>
          </div>

          {!currentUserAnswers ? (
            <div
              className={`${blockCls} mx-auto max-w-[500px] p-12 text-center`}
            >
              <i className="bi bi-clipboard2-check mb-4 block text-[2.5rem] text-[#6c757d]"></i>
              <h2 className="mb-2 text-xl font-bold text-white">
                {t("roommates.notPassedTest")}
              </h2>
              <p className="mb-6 text-sm text-[#6c757d]">
                {t("roommates.notPassedTestDesc")}
              </p>
              <button
                className={`${spinBtnCls} h-[42px]`}
                onClick={() => navigate("/test")}
              >
                {t("roommates.passTestBtn")}
              </button>
            </div>
          ) : isLoadingMatches ? (
            <div className="py-12 text-center">
              <div
                className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-[0.25em] border-[#f8f9fa] border-r-transparent"
                role="status"
              ></div>
              <p className="mb-4 text-sm text-[#6c757d]">
                {t("roommates.loadingMatches")}
              </p>
            </div>
          ) : potentialMatches.length === 0 ? (
            <div className="py-12 text-center text-[#6c757d]">
              <p className="mb-4">{t("roommates.noCandidates")}</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {potentialMatches.map((candidate) => {
                const theirAnswers = candidate.answers || {};
                return (
                  <div key={candidate.id} className={colCandidate}>
                    <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-6 text-center transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-focus">
                      <img
                        src={candidate.avatar || defaultUser}
                        alt="avatar"
                        className="mx-auto mb-3.5 h-20 w-20 rounded-full border border-line-focus object-cover"
                      />
                      <h2 className="mb-4 truncate text-base font-bold text-white">
                        {candidate.firstName} {candidate.lastName}
                      </h2>

                      <div className="mb-6 flex justify-center gap-2">
                        {matchCategories.map((cat) => {
                          const status = calculateBlockStatus(
                            currentUserAnswers,
                            theirAnswers,
                            cat.ids,
                          );
                          const categoryTitle = t(`test.categories.${cat.key}`);
                          const matchVerdict =
                            status === "green"
                              ? t("roommates.compatible")
                              : t("roommates.incompatible");

                          return (
                            <div
                              key={cat.key}
                              className={
                                compatBase +
                                (status === "green" ? compatGreen : compatRed)
                              }
                              title={`${categoryTitle}: ${matchVerdict}`}
                            >
                              <span>{cat.icon}</span>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="mt-auto flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-line bg-page text-[13.5px] font-semibold text-white transition-all duration-150 hover:border-[#525252] hover:bg-[#181818]"
                        onClick={() =>
                          navigate("/chat", {
                            state: { startChatWith: candidate },
                          })
                        }
                      >
                        <i className="bi bi-chat-text"></i>{" "}
                        {t("roommates.writeMessage")}
                      </button>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Roommates;
