"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Works } from "@/components/sections/Works";
import { About } from "@/components/sections/About";
import { Facts } from "@/components/sections/Facts";
import { Process } from "@/components/sections/Process";
import { Pricing } from "@/components/sections/Pricing";
import { Reviews } from "@/components/sections/Reviews";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { LeadModal } from "@/components/sections/LeadModal";
import { ThankYou } from "@/components/pages/ThankYou";
import { PrivacyPolicy } from "@/components/pages/PrivacyPolicy";
import { BriefPage } from "@/components/pages/BriefPage";
import { openLeadForm, openQuestionForm } from "@/components/ui/LeadCard";
import { PREVIEW_READY, PREVIEW_RENDER, type PreviewRender } from "../preview-protocol";

/**
 * Runs inside the /admin/preview iframe: renders the public components with the content posted by the editor.
 * Nothing leaves the page: requests to /api/* are answered locally with an error, and links do not navigate
 * (in-page anchors still scroll).
 */

let guarded = false;
function guardPage() {
  if (guarded) return;
  guarded = true;
  const realFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (new URL(url, window.location.href).pathname.startsWith("/api/"))
      return Promise.resolve(new Response(JSON.stringify({ ok: false, preview: true }), { status: 503, headers: { "content-type": "application/json" } }));
    return realFetch(input, init);
  };
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("#")) return;
      e.preventDefault();
    },
    true,
  );
}

class Boundary extends Component<{ children: ReactNode; stamp: number }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  componentDidUpdate(prev: { stamp: number }) {
    if (prev.stamp !== this.props.stamp && this.state.error) this.setState({ error: null });
  }
  render() {
    if (this.state.error)
      return (
        <div className="m-8 rounded-2xl border border-orange/50 bg-orange/10 p-6 font-body text-[16px] text-white">
          <p className="font-semibold text-orange">Предпросмотр не может отрисовать блок с текущими данными.</p>
          <p className="mt-2 text-white/70">Скорее всего, указан несуществующий путь к файлу или незаполнено поле. Исправьте ошибки в форме — предпросмотр обновится сам.</p>
          <p className="mt-3 font-mono text-[12px] text-white/40">{this.state.error}</p>
        </div>
      );
    return this.props.children;
  }
}

const PreviewButton = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="rounded-full border border-white/20 px-4 py-2 text-[14px] text-white transition-colors hover:border-lime hover:text-lime">
    {children}
  </button>
);

function View({ msg }: { msg: PreviewRender }) {
  const { locale, site, brief, view, options } = msg;
  const modal = <LeadModal locale={locale} content={site.forms} />;
  switch (view) {
    case "hero":
      return (
        <main>
          <Hero locale={locale} content={site.hero} headerContent={site.header} />
          {modal}
        </main>
      );
    case "services":
      return (
        <main>
          <Services locale={locale} content={site.services} />
          {modal}
        </main>
      );
    case "works":
      return (
        <main>
          <Works locale={locale} content={site.works} />
        </main>
      );
    case "about":
      return (
        <main>
          <About locale={locale} content={site.about} />
        </main>
      );
    case "facts":
      return (
        <main>
          <Facts locale={locale} content={site.facts} />
        </main>
      );
    case "process":
      return (
        <main>
          <Process locale={locale} content={site.process} />
          {modal}
        </main>
      );
    case "pricing":
      return (
        <main>
          <Pricing locale={locale} content={site.pricing} />
          {modal}
        </main>
      );
    case "reviews":
      return (
        <main>
          <Reviews locale={locale} content={site.reviews} />
        </main>
      );
    case "faq":
      return (
        <main>
          <Faq locale={locale} content={site.faq} />
          {modal}
        </main>
      );
    case "contact":
      return (
        <main>
          <Contact locale={locale} content={site.contact} formsContent={site.forms} />
        </main>
      );
    case "footer":
      return (
        <>
          <div className="h-24" />
          <Footer locale={locale} content={site.footer} />
        </>
      );
    case "popups":
      return (
        <main className="min-h-dvh px-6 py-10 md:px-10">
          <p className="mb-4 font-body text-[14px] text-white/50">Откройте форму, чтобы посмотреть её с текущими правками:</p>
          <div className="flex flex-wrap gap-2">
            {site.forms.options.directions.map((d) => (
              <PreviewButton key={d.id} onClick={() => openLeadForm({ direction: d.id })}>
                {d.popupTitle}
              </PreviewButton>
            ))}
            {site.pricing.plans.map((p) => (
              <PreviewButton key={p.id} onClick={() => openLeadForm(p.lead)}>
                {p.title.filter(Boolean).join(" ")}
              </PreviewButton>
            ))}
            <PreviewButton onClick={() => openLeadForm(site.pricing.customPlan.lead)}>{site.pricing.customPlan.title}</PreviewButton>
            <PreviewButton onClick={openQuestionForm}>{site.forms.questionTitle}</PreviewButton>
          </div>
          {modal}
        </main>
      );
    case "thank-you":
      return <ThankYou question={!!options.question} locale={locale} content={site.thankYou} />;
    case "privacy":
      return <PrivacyPolicy locale={locale} content={site.privacy} />;
    case "brief": {
      return <BriefPage key={`${options.step ?? 0}`} locale={locale} content={brief.page} uiContent={brief.ui} schema={brief.schema} initialStep={options.step ?? 0} />;
    }
    case "seo":
      return null;
  }
}

export function PreviewRenderer() {
  const [msg, setMsg] = useState<PreviewRender | null>(null);
  const [stamp, setStamp] = useState(0);

  useEffect(() => {
    guardPage();
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      if (e.data?.type !== PREVIEW_RENDER) return;
      setMsg(e.data as PreviewRender);
      setStamp((s) => s + 1);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!msg) return null;
  return (
    <>
      <Boundary stamp={stamp}>
        {/* a new view or language starts from a clean state (open popups, sliders) */}
        <div key={`${msg.view}-${msg.locale}`}>
          <View msg={msg} />
        </div>
      </Boundary>
      <div className="pointer-events-none fixed bottom-3 left-3 z-[100] rounded-md bg-black/80 px-2.5 py-1 font-body text-[12px] text-amber-200">Предпросмотр · формы не отправляются</div>
    </>
  );
}
