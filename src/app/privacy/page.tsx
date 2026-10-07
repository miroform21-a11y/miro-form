import type { Metadata } from "next";
import { contacts } from "@/data/navigation";

export const metadata: Metadata = {
  title: "Політика конфіденційності — MIROFORM",
  description: "Як MIROFORM збирає, використовує та захищає персональні дані відвідувачів сайту.",
  robots: { index: true, follow: true },
};

/**
 * Template privacy policy. The wording is a standard template based on the site's contact data —
 * it should be reviewed by the owner (and a lawyer if needed) before publishing.
 */
const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Загальні положення",
    body: [
      `Ця політика описує, як ${contacts.legalName} (далі — «MIROFORM», «ми») обробляє персональні дані відвідувачів сайту та клієнтів, які залишають заявку.`,
      "Користуючись сайтом і надсилаючи заявку, ви погоджуєтеся з умовами цієї політики.",
    ],
  },
  {
    title: "2. Які дані ми збираємо",
    body: [
      "Дані, які ви вказуєте у формі заявки: ім’я, номер телефону або нікнейм у Telegram, тип проєкту, орієнтовний бюджет і коментар.",
      "Технічні дані: тип пристрою та браузера, сторінки, які ви переглядаєте, — у знеособленому вигляді для аналітики роботи сайту.",
    ],
  },
  {
    title: "3. Мета обробки",
    body: [
      "Зв’язатися з вами щодо заявки, підготувати пропозицію та виконати домовленості щодо проєкту.",
      "Покращувати роботу сайту та якість наших послуг.",
    ],
  },
  {
    title: "4. Передача даних третім особам",
    body: [
      "Ми не продаємо і не передаємо ваші персональні дані третім особам, окрім сервісів, необхідних для роботи сайту та обробки заявок (хостинг, CRM, месенджери), і випадків, передбачених законодавством України.",
    ],
  },
  {
    title: "5. Зберігання та захист",
    body: [
      "Дані зберігаються стільки, скільки потрібно для досягнення мети обробки або виконання вимог законодавства.",
      "Ми вживаємо організаційних і технічних заходів, щоб захистити дані від несанкціонованого доступу.",
    ],
  },
  {
    title: "6. Ваші права",
    body: [
      "Ви можете запросити доступ до своїх даних, їх виправлення або видалення, а також відкликати згоду на обробку, написавши нам на пошту.",
    ],
  },
  {
    title: "7. Контакти",
    body: [`${contacts.legalName}, ${contacts.legalId}.`, `E-mail: ${contacts.email}. Телефон: ${contacts.phone}.`],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ink px-5 py-12 md:px-8 md:py-20">
      <article className="mx-auto max-w-[760px]">
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/18 px-5 py-2.5 font-display text-[12px] leading-none font-medium tracking-[0.04em] text-white uppercase transition-colors duration-300 hover:border-lime hover:text-lime"
        >
          ← На головну
        </a>
        <h1 className="mt-10 font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-white md:text-[52px]">
          Політика конфіденційності
        </h1>
        <div className="mt-10 flex flex-col gap-9">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-[18px] leading-display font-semibold text-lime md:text-[20px]">{s.title}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 text-[15px] leading-[1.6] text-white/75 md:text-[16px]">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
