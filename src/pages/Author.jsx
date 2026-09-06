import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import avatarImg from "../img/profile/user.jpg"; // або будь-яке фото

const Author = () => {
  return (
    <>
      <Header />
      <main
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "calc(100vh - 65px)",
          background: "#0a0a0a",
          padding: "20px",
        }}
      >
        <section
          className="p-4 p-md-5 rounded-4 text-center"
          style={{
            maxWidth: "520px",
            width: "100%",
            background: "#121212",
            border: "1px solid #262626",
          }}
        >
          <img
            src={avatarImg}
            alt="Author"
            className="rounded-circle object-fit-cover mb-3"
            style={{
              width: "110px",
              height: "110px",
              border: "2px solid #404040",
            }}
          />
          <h1 className="h4 fw-bold text-white mb-1">Назарій Яворський</h1>
          <p className="text-primary small fw-semibold mb-3">
            Студент кафедри САПР, ІКНІ
          </p>

          <p
            className="text-secondary small mb-4"
            style={{ lineHeight: "1.6" }}
          >
            Розробник платформи Dormly в рамках розрахунково-графічної роботи з
            дисципліни «Технології веб-розробки та дизайну». Спеціалізація:
            Frontend/Fullstack розробка (React, TypeScript, Firebase, SCSS).
          </p>

          <div className="d-flex justify-content-center gap-2 mb-4">
            <span
              className="badge"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#ccc",
              }}
            >
              React JS
            </span>
            <span
              className="badge"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#ccc",
              }}
            >
              Firebase
            </span>
            <span
              className="badge"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#ccc",
              }}
            >
              SCSS / Bootstrap
            </span>
            <span
              className="badge"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#ccc",
              }}
            >
              Vite
            </span>
          </div>

          <Link
            to="/"
            className="btn btn-outline-light btn-sm rounded-pill px-4 py-2"
          >
            На головну
          </Link>
        </section>
      </main>
    </>
  );
};

export default Author;
