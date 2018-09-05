import * as cn from "classnames";
import { some } from "lodash";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { Col, Row } from "reactstrap";

import { FUNDING_ROUNDS } from "../registration/pages/LegalInformation";

import { TCompanyEtoData, TEtoSpecsData } from "../../../lib/api/eto/EtoApi.interfaces";
import { IEtoFiles } from "../../../lib/api/eto/EtoFileApi.interfaces";
import { Accordion, AccordionElement } from "../../shared/Accordion";
import { ChartDoughnut } from "../../shared/charts/ChartDoughnut";
import { DocumentsWidget } from "../../shared/DocumentsWidget";
import { InlineIcon } from "../../shared/InlineIcon";
import { ILink, MediaLinksWidget, normalizedUrl } from "../../shared/MediaLinksWidget";
import { Panel } from "../../shared/Panel";
import { IPerson, PeopleSwiperWidget } from "../../shared/PeopleSwiperWidget";
import { SectionHeader } from "../../shared/SectionHeader";
import { Slides } from "../../shared/Slides";
import { IEtoSocialProfile, SocialProfilesList } from "../../shared/SocialProfilesList";
import { TabContent, Tabs } from "../../shared/Tabs";
import { TwitterTimelineEmbed } from "../../shared/TwitterTimeline";
import { Video } from "../../shared/Video";
import { EtoOverviewStatus } from "../overview/EtoOverviewStatus";
import { EtoTimeline } from "../overview/EtoTimeline";
import { Cover } from "../publicView/Cover";
import { selectActiveCarouselTab } from "./EtoPublicComponent.utils";

import * as icon_link from "../../../assets/img/inline_icons/social_link.svg";
import * as token_icon from "../../../assets/img/token_icon.svg";
import { EtoInvestmentTermsWidget } from "../publicView/EtoInvestmentTermsWidget";
import * as styles from "./EtoPublicComponent.module.scss";

const DEFAULT_PLACEHOLDER = "N/A";

const CHART_COLORS = ["#50e3c2", "#2fb194", "#4a90e2", "#0b0e11", "#394652", "#c4c5c6"];

const swiperSettings = {
  slidesPerView: 5,
  centeredSlides: true,
  observer: true,
  spaceBetween: 80,
  breakpoints: {
    640: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    1200: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
  },
};

interface IProps {
  companyData: TCompanyEtoData;
  etoData: TEtoSpecsData;
  etoFilesData: IEtoFiles;
}

// TODO: There are lots of castings right now in this file, cause formerly the types of IProps was "any"
// The castings should be resolved when the EtoApi.interface.ts reflects the correct data types from swagger!

interface ICurrencies {
  [key: string]: string;
}

export const CURRENCIES: ICurrencies = {
  eth: "ETH",
  eur_t: "nEUR",
};

export const EtoPublicComponent: React.SFC<IProps> = ({ companyData, etoData, etoFilesData }) => {
  const preMoneyValuationEur = etoData.preMoneyValuationEur || 1;
  const existingCompanyShares = etoData.existingCompanyShares || 1;
  const newSharesToIssue = etoData.newSharesToIssue || 1;
  const equityTokensPerShare = etoData.equityTokensPerShare || 1;
  const minimumNewSharesToIssue = etoData.minimumNewSharesToIssue || 1;

  const computedNewSharePrice = preMoneyValuationEur / existingCompanyShares;
  const computedMinNumberOfTokens = newSharesToIssue * equityTokensPerShare;
  const computedMinCapEur = computedNewSharePrice * newSharesToIssue;
  const computedMaxCapEur = computedNewSharePrice * minimumNewSharesToIssue;

  const { socialChannels, companyVideo, disableTwitterFeed, companySlideshare } = companyData;

  const isTwitterFeedEnabled =
    some(socialChannels, (channel: any) => channel.type === "twitter" && channel.url.length) &&
    !disableTwitterFeed;
  const isYouTubeVideoAvailable = !!(companyVideo && companyVideo.url);
  const isSlideShareAvailable = !!(companySlideshare && companySlideshare.url);
  const hasSocialChannelsAdded = !!(socialChannels && socialChannels.length);
  const twitterUrl =
    isTwitterFeedEnabled && socialChannels
      ? (socialChannels.find(c => c.type === "twitter") as any).url
      : "";

  const marketingLinks = companyData.marketingLinks && {
    documents: companyData.marketingLinks.map(l => ({
      url: l.url || "",
      name: l.title || "",
      icon: <InlineIcon svgIcon={icon_link} />,
    })),
    name: (
      <FormattedMessage
        id="eto.public-view.documents.more-information-about-brand"
        values={{
          brandName: companyData.brandName,
        }}
      />
    ),
  };

  const documents = marketingLinks ? [marketingLinks] : [];

  return (
    <div>
      <Cover
        companyName={companyData.brandName}
        companyOneliner={companyData.companyOneliner}
        companyLogo={{
          alt: companyData.brandName,
          srcSet: {
            "1x": companyData.companyLogo as string,
          },
        }}
        companyBanner={{
          alt: companyData.brandName,
          srcSet: {
            "1x": companyData.companyBanner as string,
          },
        }}
        tags={companyData.categories}
      />

      <EtoOverviewStatus
        tokenImage={{
          srcSet: {
            "1x": etoData.equityTokenImage || token_icon,
          },
          alt: `${etoData.equityTokenSymbol} - ${etoData.equityTokenName}`,
        }}
        tokenName={etoData.equityTokenName || ""}
        tokenSymbol={etoData.equityTokenSymbol || ""}
        className="mb-4"
        numberOfInvestors={12}
        prospectusApproved={true}
        termSheet={true}
        timeToClaim={12}
        smartContractOnchain={true}
        equityTokenPrice="10000"
        newSharesGenerated="1000"
        preMoneyValuation="10000000"
        investmentAmount="100000"
        status="campaigning"
        raisedAmount="2000"
        campaigningWidget={{
          amountBacked: "amountBacked",
          investorsBacked: 22,
          investorsLimit: 500,
          wasBacked: false,
          isLoggedIn: true,
          isActivated: true,
          quote: "Lorem ipsum",
        }}
        publicWidget={{
          endInDays: 5,
          investorsBacked: 10,
          tokensGoal: 20,
          raisedTokens: 1,
          raisedETH: 1000,
          raisedNEUR: 10000,
        }}
      />

      {etoData.startDate && (
        <Row>
          <Col className="mb-4">
            <SectionHeader layoutHasDecorator={false} className="mb-4">
              <FormattedMessage id="eto.public-view.eto-timeline" />
            </SectionHeader>
            <Panel>
              <EtoTimeline
                etoStartDate={etoData.startDate}
                preEtoDuration={etoData.whitelistDurationDays}
                publicEtoDuration={etoData.publicDurationDays}
                inSigningDuration={etoData.signingDurationDays}
              />
            </Panel>
          </Col>
        </Row>
      )}

      <Row className="align-items-stretch">
        <Col
          xs={12}
          md={
            isSlideShareAvailable ||
            isTwitterFeedEnabled ||
            isYouTubeVideoAvailable ||
            hasSocialChannelsAdded
              ? 8
              : 12
          }
          className="mb-4"
        >
          <SectionHeader layoutHasDecorator={false} className="mb-4">
            <div className={styles.companyHeader}>
              <div>{companyData.brandName}</div>
              {companyData.companyWebsite && (
                <a href={normalizedUrl(companyData.companyWebsite)} target="_blank">
                  {companyData.companyWebsite || DEFAULT_PLACEHOLDER}
                </a>
              )}
            </div>
          </SectionHeader>
          <Panel className="mb-4">
            <p className="mb-4">{companyData.companyDescription || DEFAULT_PLACEHOLDER}</p>
            {companyData.keyQuoteInvestor && (
              <p className={cn(styles.quote, "mb-4")}>"{companyData.keyQuoteInvestor}"</p>
            )}
          </Panel>

          <SectionHeader layoutHasDecorator={false} className="mb-4">
            <FormattedMessage id="eto.public-view.legal-information.title" />
          </SectionHeader>

          <Panel className={styles.legalInformation}>
            <Row>
              <Col>
                <div className={styles.group}>
                  {companyData.name && (
                    <div className={styles.entry}>
                      <span className={styles.label}>
                        <FormattedMessage id="eto.public-view.legal-information.legal-company-name" />
                      </span>
                      <span className={styles.value}>{companyData.name}</span>
                    </div>
                  )}
                  {companyData.name && (
                    <div className={styles.entry}>
                      <span className={styles.label}>
                        <FormattedMessage id="eto.public-view.legal-information.legal-form" />
                      </span>
                      <span className={styles.value}>{companyData.legalForm}</span>
                    </div>
                  )}
                  {companyData.foundingDate && (
                    <div className={styles.entry}>
                      <span className={styles.label}>
                        <FormattedMessage id="eto.public-view.legal-information.incorporation-date" />
                      </span>
                      <span className={styles.value}>{companyData.foundingDate}</span>
                    </div>
                  )}
                  {companyData.registrationNumber && (
                    <div className={styles.entry}>
                      <span className={styles.label}>
                        <FormattedMessage id="eto.public-view.legal-information.registration-number" />
                      </span>
                      <span className={styles.value}>{companyData.registrationNumber}</span>
                    </div>
                  )}
                  {companyData.numberOfFounders && (
                    <div className={styles.entry}>
                      <span className={styles.label}>
                        <FormattedMessage id="eto.public-view.legal-information.number-of-founders" />
                      </span>
                      <span className={styles.value}>{companyData.numberOfFounders}</span>
                    </div>
                  )}
                  {companyData.numberOfEmployees && (
                    <div className={styles.entry}>
                      <span className={styles.label}>
                        <FormattedMessage id="eto.public-view.legal-information.number-of-employees" />
                      </span>
                      <span className={styles.value}>{companyData.numberOfEmployees}</span>
                    </div>
                  )}
                  {companyData.lastFundingSizeEur && (
                    <div className={styles.entry}>
                      <span className={styles.label}>
                        <FormattedMessage id="eto.public-view.legal-information.last-founding-amount" />
                      </span>
                      <span className={styles.value}>{`€ ${companyData.lastFundingSizeEur}`}</span>
                    </div>
                  )}
                  {companyData.companyStage && (
                    <div className={styles.entry}>
                      <span className={styles.label}>
                        <FormattedMessage id="eto.public-view.legal-information.last-founding-round" />
                      </span>
                      <span className={styles.value}>
                        {FUNDING_ROUNDS[companyData.companyStage]}
                      </span>
                    </div>
                  )}
                  {etoData.preMoneyValuationEur && (
                    <div className={styles.entry}>
                      <span className={styles.label}>
                        <FormattedMessage id="eto.public-view.legal-information.pre-money-valuation" />
                      </span>
                      <span className={styles.value}>{`€ ${etoData.preMoneyValuationEur}`}</span>
                    </div>
                  )}
                  {etoData.existingCompanyShares && (
                    <div className={styles.entry}>
                      <span className={styles.label}>
                        <FormattedMessage id="eto.public-view.legal-information.existing-shares" />
                      </span>
                      <span className={styles.value}>{etoData.existingCompanyShares}</span>
                    </div>
                  )}
                  {etoData.minimumNewSharesToIssue && (
                    <div className={styles.entry}>
                      <span className={styles.label}>
                        <FormattedMessage id="eto.public-view.legal-information.minimum-new-shares-to-issue" />
                      </span>
                      <span className={styles.value}>{etoData.minimumNewSharesToIssue}</span>
                    </div>
                  )}
                  {etoData.shareNominalValueEur && (
                    <div className={styles.entry}>
                      <span className={styles.label}>
                        <FormattedMessage id="eto.public-view.legal-information.share-nominal" />
                      </span>
                      <span className={styles.value}>{etoData.shareNominalValueEur}</span>
                    </div>
                  )}
                </div>
              </Col>

              <Col>
                {companyData.shareholders && (
                  <ChartDoughnut
                    className="mb-3"
                    data={{
                      datasets: [
                        {
                          data: companyData.shareholders.map(d => d && d.shares),
                          /* tslint:disable:no-unused-variable */
                          backgroundColor: companyData.shareholders.map(
                            (_, i: number) => CHART_COLORS[i],
                          ),
                        },
                      ],
                      labels: (companyData.shareholders || []).map(d => d && d.fullName),
                    }}
                  />
                )}
              </Col>
            </Row>
          </Panel>
        </Col>
        <Col xs={12} md={4} className="mb-4 flex-column d-flex">
          <Tabs className="mb-4" layoutSize="large" layoutOrnament={false}>
            {isYouTubeVideoAvailable && (
              <TabContent tab="video">
                <Video
                  youTubeUrl={companyData.companyVideo && companyData.companyVideo.url}
                  hasModal
                />
              </TabContent>
            )}
            {isSlideShareAvailable && (
              <TabContent tab="pitch deck">
                <Slides
                  slideShareUrl={companyData.companySlideshare && companyData.companySlideshare.url}
                />
              </TabContent>
            )}
          </Tabs>
          <div
            className={cn(
              (isSlideShareAvailable || isTwitterFeedEnabled || isYouTubeVideoAvailable) && "mt-4",
            )}
          >
            <SocialProfilesList
              profiles={(companyData.socialChannels as IEtoSocialProfile[]) || []}
            />
          </div>
          {isTwitterFeedEnabled && (
            <>
              <SectionHeader layoutHasDecorator={false} className="mt-4 mb-4">
                Twitter
              </SectionHeader>
              <Panel
                narrow
                className={cn(styles.twitterPanel, "align-self-stretch", "flex-grow-1")}
              >
                <TwitterTimelineEmbed url={twitterUrl} userName={companyData.brandName} />
              </Panel>
            </>
          )}
        </Col>
      </Row>

      <Row>
        <Col className="mb-4">
          <SectionHeader layoutHasDecorator={false} className="mb-4">
            <FormattedMessage id="eto.public-view.token-terms.title" />
          </SectionHeader>
          <EtoInvestmentTermsWidget
            etoData={etoData}
            etoFilesData={etoFilesData}
            computedMaxCapEur={computedMaxCapEur}
            computedMinCapEur={computedMinCapEur}
            computedMinNumberOfTokens={computedMinNumberOfTokens}
            computedNewSharePrice={computedNewSharePrice}
          />
        </Col>
      </Row>

      {((companyData.founders && companyData.founders.members[0].name.length) ||
        (companyData.team && companyData.team.members[0].name.length)) && (
        <Row>
          <Col className="mb-4">
            <SectionHeader layoutHasDecorator={false} className="mb-4">
              <FormattedMessage id="eto.public-view.carousel.team" />
            </SectionHeader>
            <Panel>
              <PeopleSwiperWidget
                {...swiperSettings}
                people={(companyData.founders && (companyData.founders.members as IPerson[])) || []}
                navigation={{
                  nextEl: "people-swiper-founders-next",
                  prevEl: "people-swiper-founders-prev",
                }}
                layout="vertical"
              />
            </Panel>
          </Col>
        </Row>
      )}

      {((companyData.advisors && !!companyData.advisors.members[0].name.length) ||
        (companyData.notableInvestors && !!companyData.notableInvestors.members[0].name.length) ||
        (companyData.partners && !!companyData.partners.members[0].name.length) ||
        (companyData.keyCustomers && !!companyData.keyCustomers.members[0].name.length) ||
        (companyData.keyAlliances && !!companyData.keyAlliances.members[0].name.length) ||
        (companyData.boardMembers && !!companyData.boardMembers.members[0].name.length)) && (
        <Row>
          <Col className="mb-4">
            <Tabs
              className="mb-4"
              layoutSize="large"
              layoutOrnament={false}
              selectedIndex={selectActiveCarouselTab([
                companyData.advisors,
                companyData.notableInvestors,
                companyData.partners,
                companyData.keyCustomers,
                companyData.boardMembers,
                companyData.keyAlliances,
              ])}
            >
              {companyData.advisors &&
                companyData.advisors.members.length > 0 &&
                !!companyData.advisors.members[0].name.length && (
                  <TabContent tab={<FormattedMessage id="eto.public-view.carousel.tab.advisors" />}>
                    <Panel>
                      <PeopleSwiperWidget
                        {...swiperSettings}
                        people={companyData.advisors.members as IPerson[]}
                        navigation={{
                          nextEl: "people-swiper-advisors-next",
                          prevEl: "people-swiper-advisors-prev",
                        }}
                        layout="vertical"
                      />
                    </Panel>
                  </TabContent>
                )}
              {companyData.notableInvestors &&
                companyData.notableInvestors.members.length > 0 &&
                !!companyData.notableInvestors.members[0].name.length && (
                  <TabContent
                    tab={<FormattedMessage id="eto.public-view.carousel.tab.investors" />}
                  >
                    <Panel>
                      <PeopleSwiperWidget
                        {...swiperSettings}
                        people={companyData.notableInvestors.members as IPerson[]}
                        navigation={{
                          nextEl: "people-swiper-investors-next",
                          prevEl: "people-swiper-investors-prev",
                        }}
                        layout="vertical"
                      />
                    </Panel>
                  </TabContent>
                )}
              {companyData.partners &&
                companyData.partners.members.length > 0 &&
                !!companyData.partners.members[0].name.length && (
                  <TabContent tab={<FormattedMessage id="eto.public-view.carousel.tab.partners" />}>
                    <Panel>
                      <PeopleSwiperWidget
                        {...swiperSettings}
                        navigation={{
                          nextEl: "people-swiper-partners-next",
                          prevEl: "people-swiper-partners-prev",
                        }}
                        people={companyData.partners.members as IPerson[]}
                        layout="vertical"
                      />
                    </Panel>
                  </TabContent>
                )}
              {companyData.keyCustomers &&
                companyData.keyCustomers.members.length > 0 &&
                !!companyData.keyCustomers.members[0].name.length && (
                  <TabContent
                    tab={<FormattedMessage id="eto.public-view.carousel.tab.key-customers" />}
                  >
                    <Panel>
                      <PeopleSwiperWidget
                        {...swiperSettings}
                        navigation={{
                          nextEl: "people-swiper-partners-next",
                          prevEl: "people-swiper-partners-prev",
                        }}
                        people={companyData.keyCustomers.members as IPerson[]}
                        layout="vertical"
                      />
                    </Panel>
                  </TabContent>
                )}
              {companyData.boardMembers &&
                companyData.boardMembers.members.length > 0 &&
                !!companyData.boardMembers.members[0].name.length && (
                  <TabContent
                    tab={<FormattedMessage id="eto.public-view.carousel.tab.board-members" />}
                  >
                    <Panel>
                      <PeopleSwiperWidget
                        navigation={{
                          nextEl: "people-swiper-board-members-next",
                          prevEl: "people-swiper-board-members-prev",
                        }}
                        {...swiperSettings}
                        people={companyData.boardMembers.members as IPerson[]}
                        layout="vertical"
                      />
                    </Panel>
                  </TabContent>
                )}
              {companyData.keyAlliances &&
                companyData.keyAlliances.members.length > 0 &&
                !!companyData.keyAlliances.members[0].name.length && (
                  <TabContent
                    tab={<FormattedMessage id="eto.public-view.carousel.tab.key-alliances" />}
                  >
                    <Panel>
                      <PeopleSwiperWidget
                        navigation={{
                          nextEl: "people-swiper-board-members-next",
                          prevEl: "people-swiper-board-members-prev",
                        }}
                        {...swiperSettings}
                        people={companyData.keyAlliances.members as IPerson[]}
                        layout="vertical"
                      />
                    </Panel>
                  </TabContent>
                )}
            </Tabs>
          </Col>
        </Row>
      )}

      <Row>
        <Col sm={12} md={8} className="mb-4">
          <SectionHeader layoutHasDecorator={false} className="mb-4">
            <FormattedMessage id="eto.public-view.product-vision.title" />
          </SectionHeader>
          <Panel>
            <Accordion>
              {companyData.inspiration && (
                <AccordionElement
                  title={<FormattedMessage id="eto.form.product-vision.inspiration" />}
                >
                  <p>{companyData.inspiration}</p>
                </AccordionElement>
              )}
              {companyData.productVision && (
                <AccordionElement
                  title={<FormattedMessage id="eto.form.product-vision.product-vision" />}
                >
                  <p>{companyData.productVision}</p>
                </AccordionElement>
              )}
              {companyData.problemSolved && (
                <AccordionElement
                  title={<FormattedMessage id="eto.form.product-vision.problem-solved" />}
                >
                  <p>{companyData.problemSolved}</p>
                </AccordionElement>
              )}
              {companyData.customerGroup && (
                <AccordionElement
                  title={<FormattedMessage id="eto.form.product-vision.customer-group" />}
                >
                  <p>{companyData.customerGroup}</p>
                </AccordionElement>
              )}
              {companyData.sellingProposition && (
                <AccordionElement
                  title={<FormattedMessage id="eto.form.product-vision.selling-proposition" />}
                >
                  <p>{companyData.sellingProposition}</p>
                </AccordionElement>
              )}

              {((companyData.useOfCapitalList &&
                companyData.useOfCapitalList.some((e: any) => e.percent > 0)) ||
                companyData.useOfCapital) && (
                <AccordionElement
                  title={<FormattedMessage id="eto.form.product-vision.use-of-capital" />}
                >
                  <Row>
                    {companyData.useOfCapital && (
                      <Col>
                        <p>{companyData.useOfCapital}</p>
                      </Col>
                    )}
                    {companyData.useOfCapitalList && (
                      <Col md={12} lg={6}>
                        <ChartDoughnut
                          className="pr-5 pb-4"
                          layout="vertical"
                          data={{
                            datasets: [
                              {
                                data: companyData.useOfCapitalList.map(
                                  d => d && d.percent,
                                ) as number[],
                                /* tslint:disable:no-unused-variable */
                                backgroundColor: companyData.useOfCapitalList.map(
                                  (_, i: number) => CHART_COLORS[i],
                                ),
                              },
                            ],
                            labels: (companyData.useOfCapitalList || []).map(
                              d => d && d.description,
                            ) as string[],
                          }}
                        />
                      </Col>
                    )}
                  </Row>
                </AccordionElement>
              )}
              {companyData.marketingApproach && (
                <AccordionElement
                  title={<FormattedMessage id="eto.form.product-vision.marketing-approach" />}
                >
                  <p>{companyData.marketingApproach}</p>
                </AccordionElement>
              )}
              {companyData.companyMission && (
                <AccordionElement
                  title={<FormattedMessage id="eto.form.product-vision.company-mission" />}
                >
                  <p>{companyData.companyMission}</p>
                </AccordionElement>
              )}
              {companyData.roadmap && (
                <AccordionElement title={<FormattedMessage id="eto.form.product-vision.roadmap" />}>
                  <p>{companyData.roadmap}</p>
                </AccordionElement>
              )}
              {companyData.targetMarketAndIndustry && (
                <AccordionElement
                  title={<FormattedMessage id="eto.form.product-vision.target-segment" />}
                >
                  <p>{companyData.targetMarketAndIndustry}</p>
                </AccordionElement>
              )}
              {companyData.keyCompetitors && (
                <AccordionElement
                  title={<FormattedMessage id="eto.form.product-vision.key-competitors" />}
                >
                  <p>{companyData.keyCompetitors}</p>
                </AccordionElement>
              )}
              {companyData.marketTraction && (
                <AccordionElement
                  title={<FormattedMessage id="eto.form.product-vision.market-traction" />}
                >
                  <p>{companyData.marketTraction}</p>
                </AccordionElement>
              )}
            </Accordion>
          </Panel>
        </Col>
        <Col sm={12} md={4}>
          {documents[0] &&
            !!documents[0].documents[0].url && (
              <>
                <SectionHeader layoutHasDecorator={false} className="mb-4">
                  <FormattedMessage id="eto.form.documents.title" />
                </SectionHeader>

                <DocumentsWidget className="mb-4" groups={documents} />
              </>
            )}

          {companyData.companyNews &&
            !!companyData.companyNews[0].url && (
              <>
                <SectionHeader layoutHasDecorator={false} className="mb-4">
                  <FormattedMessage id="eto.form.media-links.title" />
                </SectionHeader>

                <MediaLinksWidget links={companyData.companyNews.reverse() as ILink[]} />
              </>
            )}
        </Col>
      </Row>
    </div>
  );
};
