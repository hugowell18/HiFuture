import { VisionWaves } from "./VisionWaves.jsx";
import logoUrl from "./assets/hifuture-logo-black.png";
import heroBgUrl from "./assets/OpenAI Playground 2026-06-14 at 04.46.11.png";
import salesforceLogoUrl from "./assets/salesforce-logo.svg";
import serviceNowLogoUrl from "./assets/servicenow-logo.svg";
import systemIconUrl from "./assets/system-implementation-icon.svg";

const navItems = [
  { label: "TOP", href: "#top" },
  { label: "事業内容", href: "#business" },
  { label: "実績紹介", href: "#works" },
  { label: "企業情報", href: "#company" },
  { label: "NEWS", href: "#news" },
  { label: "採用情報", href: "#recruit" },
];

const services = [
  {
    logo: salesforceLogoUrl,
    logoAlt: "Salesforce",
    logoClass: "salesforce-logo",
    title: "Salesforce導入支援",
    body: "設計から導入・定着化までを一貫して支援し、お客様のビジネス成長を加速します。",
  },
  {
    logo: serviceNowLogoUrl,
    logoAlt: "ServiceNow",
    logoClass: "servicenow-logo",
    title: "ServiceNow導入支援",
    body: "業務プロセスの最適化と生産性向上を実現する、ServiceNowの価値を最大化します。",
  },
  {
    logo: systemIconUrl,
    logoAlt: "",
    logoClass: "system-icon",
    title: "システム受託開発",
    body: "業務に寄り添うシステムを柔軟に設計・開発し、確かな品質で成果を支えます。",
  },
];

export function App() {
  return (
    <main className="site-shell">
      <section className="hero" id="top" aria-labelledby="hero-title">
        <img className="hero-bg" src={heroBgUrl} alt="" fetchPriority="high" />
        <div className="hero-tone" />

        <header className="site-header">
          <a className="brand" href="#top" aria-label="HiFuture top">
            <img src={logoUrl} alt="HiFuture" />
          </a>
          <nav aria-label="Primary navigation">
            {navItems.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <a className="scroll-rail" href="#business" aria-label="Scroll to business">
          <span>SCROLL</span>
          <i />
        </a>

        <div className="hero-copy">
          <h1 id="hero-title">
            成功させる、
            <br />
            感動させる。
          </h1>
          <p>
            Salesforce・ServiceNow・
            <br className="mobile-break" />
            システム開発で、
            <br />
            業務変革を実装する。
          </p>
        </div>

        <p className="story-copy">
          受け継いだ信頼に、
          <br />
          自分の意志で火を灯す。
        </p>

        <section className="service-layer" id="business" aria-label="事業内容">
          {services.map((service) => (
            <article className="service-card" key={service.title}>
              <img className={`service-logo ${service.logoClass}`} src={service.logo} alt={service.logoAlt} />
              <h2>{service.title}</h2>
              <p>{service.body}</p>
            </article>
          ))}
        </section>
      </section>

      <section className="vision-panel" aria-labelledby="vision-title">
        <VisionWaves />
        <div className="vision-index">
          <span>受け継いだ信頼を、未来の実装へ</span>
          <strong>VISION</strong>
        </div>
        <div className="vision-statement">
          <span>HIFUTURE VISION</span>
          <h2 id="vision-title">
            企業の変革を、
            <br />
            実装できる未来へ。
          </h2>
          <p>
            変化の先にある本質を見極め、最適なテクノロジーと確かな実行力で、
            Salesforce・ServiceNow・システム開発を横断し、お客様の未来をともに実装します。
          </p>
          <strong>日本でいちばん、質感のある会社へ。</strong>
        </div>
      </section>
    </main>
  );
}
