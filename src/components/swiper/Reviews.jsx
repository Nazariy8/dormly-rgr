import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Swiper from "swiper";
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules";
import { Star, Quote, ChevronLeft, ChevronRight } from "./Icons";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const reviewsData = [
  {
    id: 1,
    name: "Олена Коваленко",
    role: "Студентка КПІ",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=face",
    rating: 5,
    text: "Знайшла ідеального сусіда за два дні! Сервіс дуже зручний — змогла відфільтрувати за факультетом і звичками. Тепер живемо дружно й без конфліктів.",
  },
  {
    id: 2,
    name: "Андрій Мельник",
    role: "Магістрант КНУ",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face",
    rating: 5,
    text: "Переїхав до нового гуртожитку і боявся, що попадеться не той сусід. Завдяки цьому сайту знайшов людину з однаковими інтересами — разом ходимо на тренування.",
  },
  {
    id: 3,
    name: "Софія Ткаченко",
    role: "Студентка Могилянки",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=face",
    rating: 5,
    text: "Чудова платформа! Можна одразу побачити фото кімнати, прочитати про сусіда й домовитись про графік. Зекономила багато часу й нервів.",
  },
  {
    id: 4,
    name: "Дмитро Савченко",
    role: "Студент ХНУРЕ",
    avatar:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=160&h=160&fit=crop&crop=face",
    rating: 5,
    text: "Шукав сусіда, який теж любить тишу й порядок. Сайт допоміг знайти когось з однаковим ритмом життя. Дуже задоволений результатом!",
  },
  {
    id: 5,
    name: "Марія Бондар",
    role: "Студентка ЛНУ",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a6da1c6?w=160&h=160&fit=crop&crop=face",
    rating: 5,
    text: "Найкращий сервіс для студентів! Інтерфейс простий і зрозумілий, а спільнота активна. Знайшла сусідку-одногрупницю — тепер разом ходимо на пари.",
  },
  {
    id: 6,
    name: "Олег Гриценко",
    role: "Студент НУЛП",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face",
    rating: 5,
    text: "Прозорі анкети, реальні фото, швидка підтримка. Знайшов сусіда з першого тижня. Рекомендую всім, хто шукає комфортне співжиття.",
  },
];

function Stars({ count }) {
  return (
    <div className="flex gap-1" aria-label={`Рейтинг ${count} з 5 зірок`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 text-amber-400" filled />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <figure className="relative flex h-full flex-col rounded-2xl bg-[#111111] p-6 sm:p-8 border border-[#262626] transition-all duration-200 hover:border-[#404040] hover:bg-[#161616]">
      <div className="pointer-events-none absolute right-6 top-6 text-[#262626]">
        <Quote className="h-12 w-12" />
      </div>

      <Stars count={review.rating} />

      <blockquote className="relative z-10 mt-4 flex-1 text-sm sm:text-[15px] leading-relaxed text-[#a1a1a1]">
        &ldquo;{review.text}&rdquo;
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3.5 border-t border-[#262626] pt-5">
        <img
          src={review.avatar}
          alt={review.name}
          loading="lazy"
          className="h-11 w-11 rounded-full object-cover ring-1 ring-[#404040]"
        />
        <div className="text-left">
          <p className="text-[15px] font-semibold text-white m-0">
            {review.name}
          </p>
          <p className="text-xs text-[#666666] m-0">{review.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Reviews() {
  const { t } = useTranslation();
  const swiperElRef = useRef(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    if (!swiperElRef.current) return;

    swiperRef.current = new Swiper(swiperElRef.current, {
      modules: [Navigation, Pagination, Autoplay, A11y],
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      grabCursor: true,
      a11y: true,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: ".reviews-pagination",
        clickable: true,
      },
      navigation: {
        prevEl: ".reviews-prev",
        nextEl: ".reviews-next",
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 16,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
      },
    });

    return () => {
      swiperRef.current?.destroy();
      swiperRef.current = null;
    };
  }, []);

  return (
    <section
      className="w-full px-4 py-16 md:py-24 border-t border-[#262626] bg-transparent"
      id="feedbacks-heading"
      aria-label="Відгуки користувачів"
    >
      <div className="container mx-auto">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#64dfdf] mb-3">
            {t("feedbacks.badge", "Відгуки")}
          </span>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-tight text-white mb-3">
            {t("feedbacks.title", "Що кажуть наші користувачі")}
          </h2>
          <p className="text-[15px] text-[#a1a1a1] max-w-[520px] mx-auto leading-relaxed">
            {t(
              "feedbacks.subtitle",
              "Історії студентів, які знайшли ідеальних сусідів завдяки Dormly.",
            )}
          </p>
        </header>

        <div ref={swiperElRef} className="swiper reviews-swiper !pb-4 !pt-2">
          <div className="swiper-wrapper">
            {reviewsData.map((review) => (
              <div key={review.id} className="swiper-slide !h-auto">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Попередній відгук"
            className="reviews-prev flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-[#a1a1a1] border border-[#262626] transition-all hover:border-[#64dfdf] hover:text-white active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="reviews-pagination !w-auto flex items-center gap-2 [&_.swiper-pagination-bullet]:!m-0 [&_.swiper-pagination-bullet]:h-2 [&_.swiper-pagination-bullet]:w-2 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-[#333333] [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet-active]:!w-6 [&_.swiper-pagination-bullet-active]:!bg-[#64dfdf]" />

          <button
            type="button"
            aria-label="Наступний відгук"
            className="reviews-next flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-[#a1a1a1] border border-[#262626] transition-all hover:border-[#64dfdf] hover:text-white active:scale-95 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
