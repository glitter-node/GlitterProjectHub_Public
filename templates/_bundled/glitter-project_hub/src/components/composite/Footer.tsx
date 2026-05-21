import React from "react";

import { Div } from "../basic/Div";
import { A } from "../basic/A";
import { Button } from "../basic/Button";
import { H3 } from "../basic/H3";
import { H4 } from "../basic/H4";
import { P } from "../basic/P";
import { Ul } from "../basic/Ul";
import { Li } from "../basic/Li";
import { Footer as FooterBasic } from "../basic/Footer";
import { Icon } from "../basic/Icon";

const t = (key: string, params?: Record<string, string | number>) =>
  (window as any).G7Core?.t?.(key, params) ?? key;

const navigate = (path: string) => {
  (window as any).G7Core?.dispatch?.({
    handler: "navigate",
    params: { path },
  });
};

interface SocialLinks {
  github?: string;
  twitter?: string;
  discord?: string;
  facebook?: string;
  instagram?: string;
}

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  siteName?: string;
  siteDescription?: string;
  copyrightText?: string;
  socialLinks?: SocialLinks;
  linkGroups?: FooterLinkGroup[];
  className?: string;
}

const Footer: React.FC<FooterProps> = ({
  siteName,
  siteDescription,
  copyrightText,
  socialLinks = {},
  linkGroups,
  className = "",
}) => {
  const resolvedSiteName = siteName || t("footer.project_name");
  const resolvedSiteDescription = siteDescription || t("footer.description");

  const defaultLinkGroups: FooterLinkGroup[] = [
    {
      title: t("footer.community"),
      links: [
        { label: t("nav.home"), href: "/" },
        { label: t("nav.popular"), href: "/boards/popular" },
        { label: t("footer.all_boards"), href: "/boards" },
      ],
    },
    {
      title: t("footer.project"),
      links: [
        { label: t("footer.archive"), href: "/boards" },
        { label: t("footer.knowledge"), href: "/board/resources" },
        { label: t("footer.qna"), href: "/board/qna" },
      ],
    },
    {
      title: t("footer.participation"),
      links: [
        { label: t("footer.introductions"), href: "/board/introductions" },
        { label: t("footer.support"), href: "/board/support" },
        { label: t("footer.contact"), href: "/page/contact" },
      ],
    },
    {
      title: t("footer.policy"),
      links: [
        { label: t("footer.terms"), href: "/page/terms" },
        { label: t("footer.privacy"), href: "/page/privacy" },
        { label: t("footer.refund"), href: "/page/refund" },
      ],
    },
  ];

  const groups = linkGroups || defaultLinkGroups;

  const socialIconMap: Record<keyof SocialLinks, string> = {
    github: "github",
    twitter: "twitter",
    discord: "discord",
    facebook: "facebook",
    instagram: "instagram",
  };

  return (
    <FooterBasic className={"gph-footer " + className}>
      <Div className="gph-footer__inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Div className="gph-footer__grid">
          <Div className="gph-footer__brand">
            <H3 className="gph-footer__title">{resolvedSiteName}</H3>
            {resolvedSiteDescription && (
              <P className="gph-footer__description">{resolvedSiteDescription}</P>
            )}

            <Div className="gph-footer__socials">
              {Object.entries(socialLinks).map(([type, url]) =>
                url ? (
                  <A
                    key={type}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gph-footer__social-link cursor-pointer"
                    aria-label={type}
                  >
                    <Icon name={socialIconMap[type as keyof SocialLinks]} className="gph-footer__social-icon" />
                  </A>
                ) : null
              )}
            </Div>
          </Div>

          {groups.map((group, index) => (
            <Div key={index} className="gph-footer__group">
              <H4 className="gph-footer__heading">
                {group.title}
              </H4>
              <Ul className="gph-footer__links">
                {group.links.map((link, linkIndex) => (
                  <Li key={linkIndex}>
                    <Button
                      onClick={() => navigate(link.href)}
                      className="gph-footer__link cursor-pointer"
                    >
                      {link.label}
                    </Button>
                  </Li>
                ))}
              </Ul>
            </Div>
          ))}
        </Div>

        <Div className="gph-footer__legal">
          <P className="gph-footer__legal-text">
            {copyrightText || t("footer.copyright")}
          </P>
        </Div>
      </Div>
    </FooterBasic>
  );
};

export default Footer;
