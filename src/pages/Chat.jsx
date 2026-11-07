import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import defaultUser from "../img/profile/user.jpg";

/* ---------- Класи (перенесено з chat.scss) ---------- */
const scrollCls =
  "[&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent " +
  "[&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-white/10";

const wrapperCls =
  "flex h-[calc(100dvh-65px)] max-h-[calc(100dvh-65px)] w-full items-center justify-center overflow-hidden " +
  "bg-black px-4 pb-4 pt-3 text-fg " +
  "bg-[image:radial-gradient(circle_at_50%_15%,rgba(105,48,195,0.14)_0%,rgba(10,10,10,0.95)_55%,#000000_100%)] " +
  "max-[768px]:h-[calc(100dvh-60px)] max-[768px]:max-h-[calc(100dvh-60px)] max-[768px]:p-0";

const appCardCls =
  "relative flex h-full w-full max-w-[1200px] overflow-hidden rounded-[20px] border border-white/[0.08] " +
  "backdrop-blur-xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] " +
  "bg-[image:linear-gradient(180deg,rgba(18,18,18,0.85)_0%,rgba(12,12,12,0.95)_100%)] " +
  "max-[768px]:rounded-none max-[768px]:border-none";

const dotsCls = "h-2 w-2 rounded-full";

const actionBtnCls =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] " +
  "text-fg-secondary transition-all duration-150 hover:border-white/20 hover:bg-white/[0.08] hover:text-white";

const searchInputCls =
  "h-9 w-full rounded-lg border border-white/[0.07] bg-[#080808] pl-[34px] pr-3 text-[13px] text-white outline-none " +
  "transition-all duration-150 placeholder:text-[#4a4a4a] focus:border-white/[0.22] " +
  "focus:shadow-[0_0_0_2px_rgba(105,48,195,0.15)]";

const cardRowBase =
  "mb-[3px] flex cursor-pointer items-center rounded-[10px] border px-3 py-2.5 transition-all duration-150 ";

const mutedP = "mb-4 text-center text-sm text-[#6c757d]";

const outlineLightBtn =
  "mr-2 cursor-pointer rounded-full border border-[#f8f9fa] px-4 py-1 text-xs leading-normal text-[#f8f9fa] " +
  "transition-colors duration-150 hover:bg-[#f8f9fa] hover:text-black";
const outlineDangerBtn =
  "mr-2 cursor-pointer rounded-full border border-[#dc3545] px-4 py-1 text-xs leading-normal text-[#dc3545] " +
  "transition-colors duration-150 hover:bg-[#dc3545] hover:text-white";

const modalLabelCls = "mb-4 text-sm font-semibold uppercase text-[#6c757d]";
const modalRowCls =
  "mb-2 flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#080808] p-2";

const unreadBadgeCls =
  "ml-2 inline-block whitespace-nowrap rounded-full bg-[#dc3545] px-[0.65em] py-[0.35em] text-center " +
  "text-[10px] font-bold leading-none text-white";

const Chat = ({ user }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [activeChatUser, setActiveChatUser] = useState(null);

  const [drafts, setDrafts] = useState(() => {
    const savedDrafts = localStorage.getItem("chat_drafts");
    return savedDrafts ? JSON.parse(savedDrafts) : {};
  });

  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [friendStatus, setFriendStatus] = useState("none");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (location.state && location.state.startChatWith) {
      const targetUser = location.state.startChatWith;
      setActiveChatUser(targetUser);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChatUser) return;

    setIsUploading(true);
    const storageRef = ref(storage, `chat_images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error("Помилка завантаження:", error);
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await sendImageMessage(downloadURL);
        setIsUploading(false);
        const fileInput = document.getElementById("image-input");
        if (fileInput) fileInput.value = "";
      },
    );
  };

  const sendImageMessage = async (url) => {
    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    const messageData = {
      senderId: user.uid,
      createdAt: serverTimestamp(),
      image: url,
      text: "",
    };

    await addDoc(collection(db, "chats", combinedId, "messages"), messageData);

    await updateDoc(doc(db, "chats", combinedId), {
      lastMessage: t("chat.photoAttachment"),
      lastMessageSender: user.uid,
      updatedAt: serverTimestamp(),
      [`unreadCounts.${activeChatUser.id}`]: increment(1),
      [`unreadCounts.${user.uid}`]: 0,
    });
  };

  useEffect(() => {
    if (!user) return;

    const qReq = query(
      collection(db, "friend_requests"),
      where("receiverId", "==", user.uid),
      where("status", "==", "pending"),
    );

    const unsubReq = onSnapshot(qReq, async (snapshot) => {
      const reqs = await Promise.all(
        snapshot.docs.map(async (d) => {
          const data = d.data();
          const userSnap = await getDoc(doc(db, "users", data.senderId));
          return { id: d.id, ...data, senderData: userSnap.data() };
        }),
      );
      setIncomingRequests(reqs);
    });

    const unsubFriends = onSnapshot(doc(db, "users", user.uid), async (d) => {
      if (d.exists() && d.data().friends) {
        const friendsIds = d.data().friends;
        const friendsData = await Promise.all(
          friendsIds.map(async (id) => {
            const fSnap = await getDoc(doc(db, "users", id));
            return { id: fSnap.id, ...fSnap.data() };
          }),
        );
        setMyFriends(friendsData);
      }
    });

    return () => {
      unsubReq();
      unsubFriends();
    };
  }, [user]);

  useEffect(() => {
    const searchUsers = async () => {
      const cleanSearch = searchTerm.trim().toLowerCase();
      if (cleanSearch.length < 3) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", cleanSearch));
        const querySnapshot = await getDocs(q);
        const users = [];

        querySnapshot.forEach((d) => {
          if (user && d.id !== user.uid) {
            users.push({ id: d.id, ...d.data() });
          }
        });

        setSearchResults(users);
      } catch (error) {
        console.error("Помилка точного пошуку:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, user]);

  const handleSendMessage = async () => {
    const text = drafts[activeChatUser?.id];
    if (!text || text.trim() === "") return;

    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    try {
      const chatRef = doc(db, "chats", combinedId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, activeChatUser.id],
        });
      }

      await addDoc(collection(db, "chats", combinedId, "messages"), {
        text: text,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });

      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageSender: user.uid,
        updatedAt: serverTimestamp(),
        [`unreadCounts.${activeChatUser.id}`]: increment(1),
        [`unreadCounts.${user.uid}`]: 0,
      });

      setDrafts((prev) => {
        const newDrafts = { ...prev, [activeChatUser.id]: "" };
        localStorage.setItem("chat_drafts", JSON.stringify(newDrafts));
        return newDrafts;
      });
    } catch (error) {
      console.error("Помилка відправки повідомлення:", error);
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleAddFriend = async () => {
    if (!activeChatUser || !user) return;
    try {
      await addDoc(collection(db, "friend_requests"), {
        senderId: user.uid,
        receiverId: activeChatUser.id,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setFriendStatus("pending");
    } catch (error) {
      console.error("Помилка при додаванні в друзі:", error);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeChatUser || !user) return;
    try {
      const q = query(
        collection(db, "friend_requests"),
        where("senderId", "==", user.uid),
        where("receiverId", "==", activeChatUser.id),
        where("status", "==", "pending"),
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (d) => {
        await deleteDoc(doc(db, "friend_requests", d.id));
      });
      setFriendStatus("none");
    } catch (error) {
      console.error("Помилка при скасуванні заявки:", error);
    }
  };

  useEffect(() => {
    if (!activeChatUser || !user) return;

    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    const q = query(
      collection(db, "chats", combinedId, "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((d) => {
        msgs.push({ id: d.id, ...d.data() });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeChatUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsPromises = snapshot.docs.map(async (chatDoc) => {
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find((id) => id !== user.uid);
        let otherUserData = {};
        if (otherUserId) {
          const userSnap = await getDoc(doc(db, "users", otherUserId));
          if (userSnap.exists()) {
            otherUserData = userSnap.data();
          }
        }

        return {
          id: chatDoc.id,
          ...chatData,
          otherUser: { id: otherUserId, ...otherUserData },
        };
      });

      const resolvedChats = await Promise.all(chatsPromises);
      setChatHistory(resolvedChats);
    });

    return () => unsubscribe();
  }, [user]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    const checkFriendStatus = async () => {
      if (!activeChatUser || !user) return;
      setFriendStatus("none");

      const currentUserSnap = await getDoc(doc(db, "users", user.uid));
      if (currentUserSnap.exists()) {
        const userData = currentUserSnap.data();
        if (userData.friends && userData.friends.includes(activeChatUser.id)) {
          setFriendStatus("friends");
          return;
        }
      }

      const q = query(
        collection(db, "friend_requests"),
        where("senderId", "==", user.uid),
        where("receiverId", "==", activeChatUser.id),
        where("status", "==", "pending"),
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setFriendStatus("pending");
      }
    };

    checkFriendStatus();
  }, [activeChatUser, user]);

  const handleDeleteMessage = async (msgId) => {
    if (!activeChatUser || !user) return;
    if (!window.confirm(t("chat.deleteConfirm"))) return;

    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    try {
      await deleteDoc(doc(db, "chats", combinedId, "messages", msgId));
    } catch (error) {
      console.error("Помилка видалення:", error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editDraft.trim() || !editingMessage) return;

    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    try {
      await updateDoc(
        doc(db, "chats", combinedId, "messages", editingMessage.id),
        {
          text: editDraft,
          isEdited: true,
        },
      );
      setEditingMessage(null);
      setEditDraft("");
    } catch (error) {
      console.error("Помилка редагування:", error);
    }
  };

  const handleMessageOptions = (e, msg) => {
    e.preventDefault();
    if (msg.senderId !== user.uid) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const menuWidth = 160;
    const menuHeight = 85;

    let posX = e.clientX;
    let posY = e.clientY;

    if (posX + menuWidth > screenWidth) posX -= menuWidth;
    if (posY + menuHeight > screenHeight) posY -= menuHeight;

    setContextMenu({ mouseX: posX, mouseY: posY, msg });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleChatClick = async (chat) => {
    setActiveChatUser(chat.otherUser);
    if (chat.unreadCounts && chat.unreadCounts[user.uid] > 0) {
      try {
        await updateDoc(doc(db, "chats", chat.id), {
          [`unreadCounts.${user.uid}`]: 0,
        });
      } catch (error) {
        console.error("Помилка оновлення статусу:", error);
      }
    }
  };

  const formatDateDivider = (timestamp) => {
    if (!timestamp) return "";
    const messageDate = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(messageDate, today)) {
      return t("chat.today");
    } else if (isSameDay(messageDate, yesterday)) {
      return t("chat.yesterday");
    } else {
      return messageDate.toLocaleDateString([], {
        day: "numeric",
        month: "long",
      });
    }
  };

  const acceptFriendRequest = async (requestId, senderId) => {
    try {
      await updateDoc(doc(db, "friend_requests", requestId), {
        status: "accepted",
      });
      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayUnion(senderId),
      });
      await updateDoc(doc(db, "users", senderId), {
        friends: arrayUnion(user.uid),
      });
    } catch (error) {
      console.error("Помилка при прийнятті запиту:", error);
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, "friend_requests", requestId));
    } catch (error) {
      console.error("Помилка при відхиленні запиту:", error);
    }
  };

  const removeFriend = async (friendId) => {
    if (!window.confirm(t("chat.deleteFriendConfirm"))) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayRemove(friendId),
      });
      await updateDoc(doc(db, "users", friendId), {
        friends: arrayRemove(user.uid),
      });
    } catch (error) {
      console.error("Помилка при видаленні з друзів:", error);
    }
  };

  const mobileChatActive = Boolean(activeChatUser);

  return (
    <main className={wrapperCls}>
      <div className={appCardCls}>
        {/* ЛІВА ПАНЕЛЬ */}
        <aside
          className={
            "flex h-full w-[340px] min-w-[280px] shrink-0 flex-col border-r border-white/[0.07] " +
            "bg-[rgba(14,14,14,0.6)] max-[768px]:w-full " +
            (mobileChatActive ? "max-[768px]:hidden" : "")
          }
        >
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-[5px]">
                <span className={`${dotsCls} bg-[#ef4444]`}></span>
                <span className={`${dotsCls} bg-[#eab308]`}></span>
                <span className={`${dotsCls} bg-[#22c55e]`}></span>
              </div>
              <h2 className="m-0 text-base font-bold tracking-[-0.01em] text-white">
                {t("chat.title")}
              </h2>
            </div>
            <div className="flex items-center">
              <div className="relative inline-block">
                <button
                  type="button"
                  className={actionBtnCls}
                  onClick={() => setShowSocialModal(true)}
                  title={t("chat.modalTitle")}
                >
                  <i className="bi bi-person-lines-fill"></i>
                </button>
                {incomingRequests.length > 0 && (
                  <span className="absolute left-full top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#dc3545] p-1"></span>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-white/5 px-4 py-3">
            <div className="relative flex items-center">
              <i className="bi bi-search absolute left-3 text-[13px] text-[#555555]"></i>
              <input
                type="text"
                className={searchInputCls}
                placeholder={t("chat.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto p-2 ${scrollCls}`}>
            {searchTerm.length > 0 ? (
              <>
                <div className="mb-2 mt-2 px-2 text-sm font-semibold uppercase text-[#6c757d]">
                  {t("chat.searchResults")}
                </div>
                {searchTerm.length < 3 ? (
                  <p className={`mt-6 ${mutedP}`}>{t("chat.searchMinChars")}</p>
                ) : isSearching ? (
                  <p className={`mt-6 ${mutedP}`}>{t("chat.searching")}</p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((u) => (
                    <div
                      key={u.id}
                      className={`${cardRowBase} border-transparent hover:bg-white/[0.03]`}
                      onClick={() => {
                        setActiveChatUser(u);
                        setSearchTerm("");
                      }}
                    >
                      <img
                        src={u.avatar || defaultUser}
                        alt="avatar"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="ml-4 overflow-hidden">
                        <div className="m-0 truncate text-sm font-medium text-white">
                          {u.firstName} {u.lastName}
                        </div>
                        <small className="text-[11.5px] text-[#6c757d]">
                          @{u.username}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`mt-6 ${mutedP}`}>{t("chat.noUsersFound")}</p>
                )}
              </>
            ) : chatHistory.length === 0 ? (
              <p className={`mt-12 px-4 ${mutedP}`}>{t("chat.noChatsYet")}</p>
            ) : (
              chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={
                    cardRowBase +
                    (activeChatUser?.id === chat.otherUser.id
                      ? "border-white/10 bg-white/[0.06]"
                      : "border-transparent hover:bg-white/[0.03]")
                  }
                  onClick={() => handleChatClick(chat)}
                >
                  <img
                    src={chat.otherUser.avatar || defaultUser}
                    alt="avatar"
                    className="h-[42px] w-[42px] shrink-0 rounded-full object-cover"
                  />
                  <div className="ml-4 grow overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-semibold text-white">
                        {chat.otherUser.firstName} {chat.otherUser.lastName}
                      </span>

                      {chat.unreadCounts?.[user.uid] > 0 && (
                        <span className={unreadBadgeCls}>
                          {chat.unreadCounts[user.uid]}
                        </span>
                      )}
                    </div>

                    <small className="mt-1 block truncate text-xs text-[#6c757d]">
                      {chat.lastMessageSender === user.uid && (
                        <span className="font-medium text-white">
                          {t("chat.you")}{" "}
                        </span>
                      )}
                      {chat.lastMessage || t("chat.noMessages")}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ПРАВА ПАНЕЛЬ */}
        <section
          className={
            "flex h-full flex-1 flex-col overflow-hidden " +
            (mobileChatActive ? "max-[768px]:w-full" : "max-[768px]:hidden")
          }
        >
          {activeChatUser ? (
            <>
              <header className="flex h-[60px] shrink-0 items-center border-b border-white/[0.06] bg-[rgba(14,14,14,0.4)] px-6">
                <button
                  className="mr-4 cursor-pointer p-0 text-[#6c757d] md:hidden"
                  onClick={() => setActiveChatUser(null)}
                >
                  <i className="bi bi-arrow-left text-[1.5rem]"></i>
                </button>

                <img
                  src={activeChatUser.avatar || defaultUser}
                  alt="avatar"
                  className="h-[38px] w-[38px] rounded-full object-cover"
                />
                <div className="ml-4">
                  <h1 className="m-0 text-base font-bold text-white">
                    {activeChatUser.firstName} {activeChatUser.lastName}
                  </h1>
                  <small className="text-[11.5px] text-[#6c757d]">
                    @{activeChatUser.username}
                  </small>
                </div>

                <div className="ml-auto flex items-center">
                  {friendStatus === "none" && (
                    <button
                      className={outlineLightBtn}
                      onClick={handleAddFriend}
                    >
                      <i className="bi bi-person-plus"></i>{" "}
                      {t("chat.addFriend")}
                    </button>
                  )}

                  {friendStatus === "pending" && (
                    <button
                      className={outlineDangerBtn}
                      onClick={handleCancelRequest}
                    >
                      <i className="bi bi-x-circle"></i>{" "}
                      {t("chat.cancelRequest")}
                    </button>
                  )}

                  {friendStatus === "friends" && (
                    <span className="mr-2 inline-block whitespace-nowrap rounded-full bg-[#051b11] px-4 py-1 text-center text-[11px] font-bold leading-none text-[#198754]">
                      <i className="bi bi-person-check mr-1"></i>{" "}
                      {t("chat.friends")}
                    </span>
                  )}
                </div>
              </header>

              <div
                className={`flex flex-1 flex-col overflow-y-auto p-6 ${scrollCls}`}
              >
                <div className="my-4 text-center">
                  <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1 text-[11.5px] text-[#777777]">
                    {t("chat.chatHistoryStart", {
                      name: activeChatUser.firstName,
                    })}
                  </span>
                </div>

                {messages.map((msg, index) => {
                  const isMine = msg.senderId === user.uid;
                  let showDateDivider = false;
                  let dateString = "";

                  if (msg.createdAt) {
                    dateString = formatDateDivider(msg.createdAt);
                    if (index === 0) {
                      showDateDivider = true;
                    } else {
                      const prevMsg = messages[index - 1];
                      if (
                        prevMsg?.createdAt &&
                        dateString !== formatDateDivider(prevMsg.createdAt)
                      ) {
                        showDateDivider = true;
                      }
                    }
                  }

                  return (
                    <div key={msg.id}>
                      {showDateDivider && (
                        <div className="my-4 flex justify-center">
                          <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1 text-[11px] font-medium text-[#888888]">
                            {dateString}
                          </span>
                        </div>
                      )}

                      <div
                        className={`mb-2 flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={
                            "relative max-w-[70%] border px-4 py-2 [word-break:break-word] " +
                            (isMine
                              ? "cursor-pointer rounded-[16px_16px_3px_16px] border-white bg-white text-black shadow-[0_4px_12px_rgba(255,255,255,0.15)]"
                              : "cursor-default rounded-[16px_16px_16px_3px] border-white/[0.08] bg-[#141414] text-fg")
                          }
                          onContextMenu={(e) => handleMessageOptions(e, msg)}
                          onClick={(e) => handleMessageOptions(e, msg)}
                        >
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="attachment"
                              className="mb-2 max-h-[260px] w-full cursor-pointer rounded-lg object-cover"
                              onClick={() => window.open(msg.image, "_blank")}
                            />
                          )}
                          {msg.text && (
                            <div className="text-[13.5px] leading-[1.4]">
                              {msg.text}
                            </div>
                          )}

                          <div
                            className={
                              "mt-1 flex items-center gap-1 text-[10.5px] " +
                              (isMine
                                ? "justify-end text-[#6c757d]"
                                : "justify-start text-[#6c757d]")
                            }
                          >
                            {msg.isEdited && (
                              <span className="italic">
                                ({t("chat.edited")})
                              </span>
                            )}
                            <span>{formatTime(msg.createdAt)}</span>
                            {isMine && (
                              <i className="bi bi-check2-all ml-1"></i>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <footer className="shrink-0 border-t border-white/[0.06] bg-[rgba(14,14,14,0.6)] px-6 py-4">
                {editingMessage && (
                  <div className="mb-2 flex items-center justify-between px-2 text-sm text-[#ffc107]">
                    <span>
                      <i className="bi bi-pencil mr-1"></i>{" "}
                      {t("chat.editMessage")}
                    </span>
                    <i
                      className="bi bi-x-lg cursor-pointer"
                      onClick={() => setEditingMessage(null)}
                    ></i>
                  </div>
                )}

                <div className="flex items-center rounded-xl border border-white/[0.08] bg-[#080808] px-2 py-[5px] transition-all duration-200 focus-within:border-white/[0.22] focus-within:shadow-[0_0_0_3px_rgba(105,48,195,0.15)]">
                  <label
                    htmlFor="image-input"
                    className={
                      "flex h-[34px] w-[34px] items-center justify-center p-0 text-[#6c757d] " +
                      (isUploading ? "cursor-not-allowed" : "cursor-pointer")
                    }
                  >
                    {isUploading ? (
                      <div
                        className="h-4 w-4 animate-spin rounded-full border-[3px] border-[#f8f9fa] border-r-transparent"
                        role="status"
                      ></div>
                    ) : (
                      <i className="bi bi-paperclip text-[1.25rem]"></i>
                    )}
                    <input
                      type="file"
                      id="image-input"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>

                  <input
                    ref={inputRef}
                    type="text"
                    className="min-w-0 flex-1 border-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-[#525252]"
                    placeholder={
                      editingMessage
                        ? t("chat.editInputPlaceholder")
                        : t("chat.inputPlaceholder")
                    }
                    value={
                      editingMessage
                        ? editDraft
                        : drafts[activeChatUser.id] || ""
                    }
                    onChange={(e) => {
                      const text = e.target.value;
                      if (editingMessage) {
                        setEditDraft(text);
                      } else {
                        setDrafts((prev) => {
                          const newDrafts = {
                            ...prev,
                            [activeChatUser.id]: text,
                          };
                          localStorage.setItem(
                            "chat_drafts",
                            JSON.stringify(newDrafts),
                          );
                          return newDrafts;
                        });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        editingMessage ? handleSaveEdit() : handleSendMessage();
                      }
                    }}
                  />

                  <button
                    className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-lg border-none bg-white text-black transition-all duration-150 hover:-translate-y-px hover:bg-[#e5e5e5]"
                    onClick={
                      editingMessage ? handleSaveEdit : handleSendMessage
                    }
                    aria-label="Send"
                  >
                    {editingMessage ? (
                      <i className="bi bi-check-lg text-[1.25rem]"></i>
                    ) : (
                      <i className="bi bi-arrow-up text-[1.25rem]"></i>
                    )}
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <i className="bi bi-chat-dots mb-4 text-[2.5rem] text-[#6c757d] opacity-50"></i>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-6 py-2 text-sm text-[#6c757d]">
                {t("chat.noChatSelected")}
              </span>
            </div>
          )}
        </section>
      </div>

      {/* Контекстне меню */}
      {contextMenu && (
        <div
          className="fixed z-[9999] rounded-[10px] border border-white/10 bg-[#141414] shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
          style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
        >
          <div
            className="flex cursor-pointer items-center gap-2 px-3.5 py-2 text-[13px] text-fg hover:bg-white/5"
            onClick={() => {
              setEditingMessage(contextMenu.msg);
              setEditDraft(contextMenu.msg.text);
            }}
          >
            <i className="bi bi-pencil"></i> {t("chat.edit")}
          </div>
          <div
            className="flex cursor-pointer items-center gap-2 px-3.5 py-2 text-[13px] text-[#dc3545] hover:bg-white/5"
            onClick={() => handleDeleteMessage(contextMenu.msg.id)}
          >
            <i className="bi bi-trash"></i> {t("chat.delete")}
          </div>
        </div>
      )}

      {/* Модалка друзів */}
      {showSocialModal && (
        <div
          className="fixed inset-0 z-[1055] overflow-y-auto bg-black/80 backdrop-blur-[8px]"
          onClick={() => setShowSocialModal(false)}
        >
          <div
            className="mx-2 my-2 flex min-h-[calc(100%-1rem)] items-center min-[576px]:mx-auto min-[576px]:my-7 min-[576px]:min-h-[calc(100%-3.5rem)] min-[576px]:max-w-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full rounded-[18px] border border-white/10 bg-[#111111] text-white">
              <div className="flex items-center justify-between p-4 pb-0">
                <h2 className="m-0 text-xl font-bold">
                  {t("chat.modalTitle")}
                </h2>
                <button
                  type="button"
                  aria-label="Close"
                  className="cursor-pointer p-1 text-white/50 transition-colors duration-150 hover:text-white/75"
                  onClick={() => setShowSocialModal(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className={`max-h-[380px] overflow-y-auto p-4 ${scrollCls}`}>
                <div className={modalLabelCls}>
                  {t("chat.requests")} ({incomingRequests.length})
                </div>
                {incomingRequests.length === 0 && (
                  <p className="mb-6 text-sm text-[#6c757d]">
                    {t("chat.noRequests")}
                  </p>
                )}

                {incomingRequests.map((req) => (
                  <div key={req.id} className={modalRowCls}>
                    <div className="flex items-center overflow-hidden">
                      <img
                        src={req.senderData?.avatar || defaultUser}
                        width="38"
                        height="38"
                        className="h-[38px] w-[38px] shrink-0 rounded-full object-cover"
                        alt="avatar"
                      />
                      <div className="ml-4 overflow-hidden">
                        <div className="truncate text-sm font-semibold">
                          {req.senderData?.firstName} {req.senderData?.lastName}
                        </div>
                        <div className="text-[11.5px] text-[#6c757d]">
                          @{req.senderData?.username}
                        </div>
                      </div>
                    </div>

                    <div className="ml-2 flex gap-2">
                      <button
                        className="cursor-pointer rounded-full border border-[#f8f9fa] bg-[#f8f9fa] px-4 py-1 text-xs font-semibold leading-normal text-black transition-colors duration-150 hover:border-[#c6c7c8] hover:bg-[#d3d4d5]"
                        onClick={() =>
                          acceptFriendRequest(req.id, req.senderId)
                        }
                      >
                        {t("chat.accept")}
                      </button>
                      <button
                        className="cursor-pointer rounded-full border border-[#6c757d] px-2 py-1 text-xs leading-normal text-[#6c757d] transition-colors duration-150 hover:bg-[#6c757d] hover:text-white"
                        onClick={() => rejectFriendRequest(req.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}

                <hr className="my-6 border-white/[0.04]" />

                <div className={modalLabelCls}>
                  {t("chat.myFriends")} ({myFriends.length})
                </div>
                {myFriends.length === 0 && (
                  <p className="mb-0 text-sm text-[#6c757d]">
                    {t("chat.noFriends")}
                  </p>
                )}

                {myFriends.map((friend) => (
                  <div key={friend.id} className={modalRowCls}>
                    <div className="flex items-center">
                      <img
                        src={friend.avatar || defaultUser}
                        width="34"
                        height="34"
                        className="h-[34px] w-[34px] rounded-full object-cover"
                        alt="avatar"
                      />
                      <div className="ml-2">
                        <div className="text-sm font-semibold">
                          {friend.firstName} {friend.lastName}
                        </div>
                        <div className="text-[11.5px] text-[#6c757d]">
                          @{friend.username}
                        </div>
                      </div>
                    </div>

                    <button
                      className="cursor-pointer px-2 py-1 text-[#6c757d]"
                      onClick={() => removeFriend(friend.id)}
                    >
                      <i className="bi bi-person-x text-[1.25rem]"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Chat;
