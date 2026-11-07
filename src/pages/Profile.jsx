import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import defaultUser from "../img/profile/user.jpg";

import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";

import {
  handleFileChange,
  handleLogout,
  handleStatusChange,
  handleProfileUpdate,
  handleGoTest,
  handleToggleChange,
  onSaveCrop,
  deleteGalleryImage,
  handleGalleryUpload,
  handleUsernameBlur,
} from "../utils/functions.jsx";

/* ---------- Класи (перенесено з profile.scss) ---------- */
const pageCls =
  "min-h-screen bg-black px-4 pb-[90px] pt-10 text-fg " +
  "bg-[image:radial-gradient(circle_at_50%_12%,rgba(105,48,195,0.16)_0%,rgba(10,10,10,0.95)_55%,#000000_100%)]";

const cardCls =
  "mb-6 rounded-[20px] border border-white/[0.08] p-6 backdrop-blur-lg transition-colors duration-200 " +
  "bg-[image:linear-gradient(180deg,rgba(20,20,20,0.75)_0%,rgba(13,13,13,0.9)_100%)] " +
  "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] hover:border-white/[0.14] md:p-8";

const topBarCls =
  "mb-6 flex items-center justify-between border-b border-white/5 pb-3.5";
const sectionTitleCls = "m-0 text-base font-bold tracking-[-0.01em] text-white";

const labelCls = "mb-1.5 text-[13px] font-medium text-fg-secondary";
const fieldBase =
  "w-full rounded-[10px] border border-white/[0.08] bg-[#070707] px-3.5 py-2.5 text-sm text-white outline-none " +
  "transition-all duration-200 placeholder:text-[#4a4a4a] focus:border-white/25 focus:bg-[#0a0a0a] " +
  "focus:shadow-[0_0_0_3px_rgba(105,48,195,0.15)]";
const selectCls = `${fieldBase} cursor-pointer appearance-none bg-no-repeat bg-[position:right_14px_center] bg-[length:11px]`;
const selectArrow =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23a1a1a1' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e\")";

const prefixGroupCls =
  "flex items-center overflow-hidden rounded-[10px] border border-white/[0.08] bg-[#070707] " +
  "transition-all duration-200 focus-within:border-white/25 focus-within:bg-[#0a0a0a] " +
  "focus-within:shadow-[0_0_0_3px_rgba(105,48,195,0.15)]";
const prefixIconCls = "flex items-center px-3 text-sm text-fg-muted";
const prefixInputCls =
  "w-full border-none bg-transparent py-2.5 pl-0 pr-3.5 text-sm text-white outline-none placeholder:text-[#4a4a4a]";

const btnSolidCls =
  "cursor-pointer rounded-lg border border-white bg-white px-5 py-2 text-[13.5px] font-semibold text-black " +
  "transition-all duration-200 hover:-translate-y-px hover:border-[#e5e5e5] hover:bg-[#e5e5e5]";
const btnOutlineCls =
  "cursor-pointer rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-[7px] text-[13px] font-medium " +
  "text-fg-secondary transition-all duration-200 hover:-translate-y-px hover:border-white/20 " +
  "hover:bg-white/[0.07] hover:text-white";

const accordionHeaderCls =
  "flex cursor-pointer select-none items-center justify-between";
const accordionTitleCls = "text-[15px] font-semibold text-white";
const toggleBtnCls =
  "flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border border-white/[0.08] " +
  "bg-[#0a0a0a] text-fg-secondary transition-all duration-150 hover:border-white/25 hover:text-white";

const habitPillCls =
  "inline-block rounded-md border border-white/[0.08] bg-[#151515] px-3.5 py-1.5 text-[12.5px] text-[#d1d5db] " +
  "transition-all duration-150 hover:border-white/[0.18] hover:text-white";

/* Рядок налаштування з перемикачем (замість Bootstrap form-switch) */
const SettingRow = ({
  title,
  desc,
  checked,
  onChange,
  last = false,
  className = "",
}) => (
  <div
    className={
      "flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#080808] px-[18px] py-3.5 " +
      "transition-colors duration-150 hover:border-white/10 " +
      (last ? "mb-0 " : "mb-2.5 ") +
      className
    }
  >
    <div>
      <div className="mb-0.5 text-sm font-medium text-fg">{title}</div>
      <div className="text-xs text-fg-secondary">{desc}</div>
    </div>
    <label className="relative m-0 inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
      />
      <span
        className={
          "relative block h-[19px] w-[37px] rounded-full border border-white/15 bg-[#1f1f1f] transition-all duration-150 " +
          "after:absolute after:left-[2px] after:top-1/2 after:h-[13px] after:w-[13px] after:-translate-y-1/2 " +
          "after:rounded-full after:bg-[#a1a1a1] after:transition-all after:duration-150 after:content-[''] " +
          "peer-checked:border-white peer-checked:bg-white peer-checked:after:translate-x-[18px] " +
          "peer-checked:after:bg-black peer-focus-visible:border-white/30"
        }
      />
    </label>
  </div>
);

const CardTopBar = ({ title, dots = false }) => (
  <div className={topBarCls}>
    <h2 className={sectionTitleCls}>{title}</h2>
    {dots && (
      <div className="flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#ef4444]"></span>
        <span className="h-2 w-2 rounded-full bg-[#eab308]"></span>
        <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
      </div>
    )}
  </div>
);

const Profile = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userAnswers, setUserAnswers] = useState(
    location.state?.userAnswers || location.state?.userAnswerIds || null,
  );
  const [loading, setLoading] = useState(true);

  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("male");
  const [bio, setBio] = useState("");

  const [instagram, setInstagram] = useState("");
  const [telegram, setTelegram] = useState("");
  const [isLookingForRoom, setIsLookingForRoom] = useState(false);

  const [gallery, setGallery] = useState([]);

  const [photoAccess, setPhotoAccess] = useState(false);
  const [sendAllow, setSendAllow] = useState(false);
  const [hideActivity, setHideActivity] = useState(false);

  const [friendsQuery, setFriendsQuery] = useState(false);
  const [friendsActivity, setFriendsActivity] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const [isHabitsOpen, setIsHabitsOpen] = useState(true);
  const [isPhotosOpen, setIsPhotosOpen] = useState(true);

  const [imageToCrop, setImageToCrop] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUsername(data.username || "");
            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setGender(data.gender || "male");
            setBio(data.bio || "");
            setInstagram(data.instagram || "");
            setTelegram(data.telegram || "");
            setAvatar(data.avatar || null);
            setIsLookingForRoom(data.status === "Шукаю кімнату");
            setGallery(data.gallery || []);

            setPhotoAccess(data.photoAccess ?? false);
            setSendAllow(data.sendAllow ?? false);
            setHideActivity(data.hideActivity ?? false);

            setFriendsQuery(data.friendsQuery ?? false);
            setFriendsActivity(data.friendsActivity ?? false);
            setShowMessages(data.showMessages ?? false);

            if (location.state?.userAnswerIds) {
              setUserAnswers(location.state.userAnswerIds);
            } else if (location.state?.userAnswers) {
              setUserAnswers(location.state.userAnswers);
            } else if (data.answers) {
              setUserAnswers(data.answers);
            }
          }
        } catch (error) {
          console.error("Помилка завантаження даних:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [location.state]);

  const getLocalizedAnswer = (questionId, value) => {
    if (value && typeof value === "string" && value.includes(".")) {
      return t(`test.questions.${questionId}.options.${value}`, {
        defaultValue: value,
      });
    }
    return value;
  };

  return (
    <div className={pageCls}>
      <main className="mx-auto max-w-[980px]">
        {/* Заголовок і статус */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-[5px] text-[12.5px] font-medium text-fg-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              <span>Dormly 2.0 Profile</span>
            </div>
            <h1 className="m-0 text-[length:clamp(1.8rem,3.5vw,2.5rem)] font-extrabold tracking-[-0.03em] text-white">
              {t("profile.title")}
            </h1>
            <p className="mt-1.5 text-sm text-fg-secondary">
              {t("profile.subtitle")}
            </p>
          </div>
          <button
            onClick={() => handleLogout(navigate)}
            className={`${btnOutlineCls} self-start sm:self-center`}
          >
            {t("profile.logoutBtn")}
          </button>
        </header>

        {/* Картка Аватара */}
        <section
          className={`${cardCls} flex flex-wrap items-center justify-between gap-5`}
        >
          <div className="flex items-center gap-4">
            <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-full border-2 border-white/[0.12] shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
              <img
                src={avatar || defaultUser}
                alt="Аватар"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="text-[19px] font-extrabold tracking-[-0.02em] text-white">
                @{username || "username"}
              </div>
              <div className="mt-0.5 text-[13.5px] text-fg-secondary">
                {firstName || lastName
                  ? `${firstName} ${lastName}`.trim()
                  : t("profile.noName")}
              </div>
            </div>
          </div>

          <label className={`${btnSolidCls} m-0`}>
            {t("profile.changePhoto")}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                handleFileChange(e, setImageToCrop, setShowCropper)
              }
              ref={fileInputRef}
            />
          </label>
        </section>

        {/* Особисті дані */}
        <section className={cardCls}>
          <CardTopBar title={t("profile.personalData")} dots />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className={labelCls} htmlFor="usernameField">
                {t("profile.username")}{" "}
                <span className="text-[#dc3545]">*</span>
              </label>
              <div className={prefixGroupCls}>
                <span className={prefixIconCls}>@</span>
                <input
                  id="usernameField"
                  type="text"
                  className={prefixInputCls}
                  placeholder="username"
                  value={username}
                  onChange={(e) => {
                    const validValue = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, "");
                    setUsername(validValue);
                    setUsernameError("");
                  }}
                  onBlur={() =>
                    handleUsernameBlur(
                      username,
                      auth.currentUser,
                      setUsernameError,
                    )
                  }
                />
              </div>
              {usernameError && (
                <small className="mt-1 text-sm text-[#dc3545]">
                  {usernameError}
                </small>
              )}
            </div>

            <div className="flex flex-col">
              <label className={labelCls} htmlFor="genderField">
                {t("profile.gender")}
              </label>
              <select
                id="genderField"
                className={selectCls}
                style={{ backgroundImage: selectArrow }}
                value={gender}
                onChange={(e) =>
                  handleProfileUpdate(
                    e.target.value,
                    "gender",
                    setGender,
                    auth.currentUser,
                  )
                }
              >
                <option value="male">{t("profile.genderMale")}</option>
                <option value="female">{t("profile.genderFemale")}</option>
                <option value="other">{t("profile.genderOther")}</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className={labelCls} htmlFor="firstNameField">
                {t("profile.firstName")}
              </label>
              <input
                id="firstNameField"
                type="text"
                className={fieldBase}
                placeholder={t("profile.firstName")}
                value={firstName}
                onChange={(e) =>
                  handleProfileUpdate(
                    e.target.value,
                    "firstName",
                    setFirstName,
                    auth.currentUser,
                  )
                }
              />
            </div>

            <div className="flex flex-col">
              <label className={labelCls} htmlFor="lastNameField">
                {t("profile.lastName")}
              </label>
              <input
                id="lastNameField"
                type="text"
                className={fieldBase}
                placeholder={t("profile.lastName")}
                value={lastName}
                onChange={(e) =>
                  handleProfileUpdate(
                    e.target.value,
                    "lastName",
                    setLastName,
                    auth.currentUser,
                  )
                }
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <label
                  className="text-[13px] font-medium text-fg-secondary"
                  htmlFor="bioField"
                >
                  {t("profile.bio")}
                </label>
                <span className="text-sm text-[#6c757d]">
                  {bio.length} / 300
                </span>
              </div>
              <textarea
                id="bioField"
                className={fieldBase}
                rows="3"
                maxLength={300}
                placeholder={t("profile.bioPlaceholder")}
                value={bio}
                onChange={(e) =>
                  handleProfileUpdate(
                    e.target.value,
                    "bio",
                    setBio,
                    auth.currentUser,
                  )
                }
              />
            </div>
          </div>

          <SettingRow
            className="mt-6"
            title={t("profile.roomStatus")}
            desc={
              isLookingForRoom
                ? t("profile.statusLooking")
                : t("profile.statusNotLooking")
            }
            checked={isLookingForRoom}
            onChange={(e) => handleStatusChange(e, setIsLookingForRoom)}
          />
        </section>

        {/* Контакти */}
        <section className={cardCls}>
          <CardTopBar title={t("profile.contactsTitle")} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className={labelCls}>{t("profile.telegram")}</label>
              <div className={prefixGroupCls}>
                <span className={prefixIconCls}>
                  <i className="bi bi-telegram"></i>
                </span>
                <input
                  type="text"
                  className={prefixInputCls}
                  placeholder="@username"
                  value={telegram}
                  onChange={(e) =>
                    handleProfileUpdate(
                      e.target.value,
                      "telegram",
                      setTelegram,
                      auth.currentUser,
                    )
                  }
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className={labelCls}>{t("profile.instagram")}</label>
              <div className={prefixGroupCls}>
                <span className={prefixIconCls}>
                  <i className="bi bi-instagram"></i>
                </span>
                <input
                  type="text"
                  className={prefixInputCls}
                  placeholder="@username"
                  value={instagram}
                  onChange={(e) =>
                    handleProfileUpdate(
                      e.target.value,
                      "instagram",
                      setInstagram,
                      auth.currentUser,
                    )
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Звички та Фото */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className={`${cardCls} h-full`}>
            <div
              className={accordionHeaderCls}
              onClick={() => setIsHabitsOpen(!isHabitsOpen)}
            >
              <span className={accordionTitleCls}>{t("profile.myHabits")}</span>
              <button type="button" className={toggleBtnCls}>
                <i className={`bi ${isHabitsOpen ? "bi-dash" : "bi-plus"}`}></i>
              </button>
            </div>

            <div
              className="grid"
              style={{
                gridTemplateRows: isHabitsOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 0.3s ease",
              }}
            >
              <div className="overflow-hidden">
                <div className="pt-6">
                  {userAnswers ? (
                    <div>
                      <div className="mb-6 flex flex-wrap gap-2">
                        {Object.keys(userAnswers).map((questionId) => (
                          <span key={questionId} className={habitPillCls}>
                            {getLocalizedAnswer(
                              questionId,
                              userAnswers[questionId],
                            )}
                          </span>
                        ))}
                      </div>
                      <Link
                        to="/test"
                        className={`${btnOutlineCls} inline-block`}
                      >
                        {t("profile.retestBtn")}
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-4 text-sm text-[#6c757d]">
                        {t("profile.noHabits")}
                      </p>
                      <button
                        className={btnSolidCls}
                        onClick={() => handleGoTest(navigate)}
                      >
                        {t("profile.passTestBtn")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className={`${cardCls} h-full`}>
            <div
              className={accordionHeaderCls}
              onClick={() => setIsPhotosOpen(!isPhotosOpen)}
            >
              <span className={accordionTitleCls}>
                {t("profile.myPhotos")} ({gallery ? gallery.length : 0})
              </span>
              <div className="flex items-center gap-2">
                <label
                  className={`${btnOutlineCls} m-0`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("profile.addPhoto")}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      handleGalleryUpload(e, auth.currentUser, setGallery)
                    }
                  />
                </label>
                <button type="button" className={toggleBtnCls}>
                  <i
                    className={`bi ${isPhotosOpen ? "bi-dash" : "bi-plus"}`}
                  ></i>
                </button>
              </div>
            </div>

            <div
              className="grid"
              style={{
                gridTemplateRows: isPhotosOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 0.3s ease",
              }}
            >
              <div className="overflow-hidden">
                <div className="pt-6">
                  {gallery && gallery.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {gallery.map((url, index) => (
                        <div
                          key={index}
                          className="relative h-[90px] w-[90px] overflow-hidden rounded-[10px] border border-white/[0.08]"
                        >
                          <img
                            src={url}
                            alt={`Gallery item ${index}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/75 text-[10px] text-white transition-colors duration-150 hover:border-[#ef4444] hover:bg-[#ef4444]"
                            onClick={() =>
                              deleteGalleryImage(
                                url,
                                auth.currentUser,
                                setGallery,
                              )
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="m-0 text-sm text-[#6c757d]">
                      {t("profile.noPhotos")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Налаштування приватності та повідомлень */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className={`${cardCls} h-full`}>
            <CardTopBar title={t("profile.privacyTitle")} />

            <SettingRow
              title={t("profile.photoAccess")}
              desc={photoAccess ? t("profile.allUsers") : t("profile.nobody")}
              checked={photoAccess}
              onChange={(e) =>
                handleToggleChange(
                  setPhotoAccess,
                  "photoAccess",
                  e.target.checked,
                )
              }
            />
            <SettingRow
              title={t("profile.sendAllow")}
              desc={sendAllow ? t("profile.all") : t("profile.contactsOnly")}
              checked={sendAllow}
              onChange={(e) =>
                handleToggleChange(setSendAllow, "sendAllow", e.target.checked)
              }
            />
            <SettingRow
              last
              title={t("profile.hideActivity")}
              desc={
                hideActivity
                  ? t("profile.statusHidden")
                  : t("profile.statusVisible")
              }
              checked={hideActivity}
              onChange={(e) =>
                handleToggleChange(
                  setHideActivity,
                  "hideActivity",
                  e.target.checked,
                )
              }
            />
          </section>

          <section className={`${cardCls} h-full`}>
            <CardTopBar title={t("profile.notificationsTitle")} />

            <SettingRow
              title={t("profile.chatMessages")}
              desc={t("profile.push")}
              checked={showMessages}
              onChange={(e) =>
                handleToggleChange(
                  setShowMessages,
                  "showMessages",
                  e.target.checked,
                )
              }
            />
            <SettingRow
              title={t("profile.friendRequests")}
              desc={t("profile.push")}
              checked={friendsQuery}
              onChange={(e) =>
                handleToggleChange(
                  setFriendsQuery,
                  "friendsQuery",
                  e.target.checked,
                )
              }
            />
            <SettingRow
              last
              title={t("profile.friendActivity")}
              desc={
                friendsActivity ? t("profile.enabled") : t("profile.disabled")
              }
              checked={friendsActivity}
              onChange={(e) =>
                handleToggleChange(
                  setFriendsActivity,
                  "friendsActivity",
                  e.target.checked,
                )
              }
            />
          </section>
        </div>
      </main>

      {/* Модалка кропера аватара */}
      {showCropper && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-[10px]">
          <div className="relative h-[380px] w-[90%] max-w-[480px] overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            />
          </div>
          <div className="mt-5 flex gap-3">
            <button
              className={btnOutlineCls}
              onClick={() => setShowCropper(false)}
            >
              {t("profile.cropper.cancel")}
            </button>
            <button
              className={btnSolidCls}
              onClick={() =>
                onSaveCrop(
                  imageToCrop,
                  croppedAreaPixels,
                  setAvatar,
                  setShowCropper,
                )
              }
            >
              {t("profile.cropper.save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
