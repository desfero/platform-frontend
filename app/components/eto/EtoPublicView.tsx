import * as React from "react";
import { Link } from "react-router-dom";
import { Settings } from "react-slick";
import { Col, Row } from "reactstrap";
import { compose } from "redux";

import { actions } from "../../modules/actions";
import { appConnect } from "../../store";
import { onEnterAction } from "../../utils/OnEnterAction";
import { FUNDING_ROUNDS } from "./registration/pages/LegalInformation";

import { LayoutAuthorized } from "../layouts/LayoutAuthorized";
import { Accordion, AccordionElement } from "../shared/Accordion";
import { DocumentsWidget } from "../shared/DocumentsWidget";
import { NewsWidget } from "../shared/NewsWidget";
import { Panel } from "../shared/Panel";
import { SectionHeader } from "../shared/SectionHeader";
import { Video } from "../shared/Video";
import { EtoOverviewStatus } from "./overview/EtoOverviewStatus";
import { Cover } from "./publicView/Cover";

import { FormattedMessage } from "react-intl";
import * as tokenIcon from "../../assets/img/neu_icon.svg";
import * as styles from "./EtoPublicView.module.scss";

const coverData = {
  coverImage: {
    alt: "",
    src: "",
    srcSet: {
      "1x": "",
      "2x": "",
      "3x": "",
    },
    width: 1230,
    height: 380,
  },
  company: {
    name: "name",
    shortDescription: "short description",
    website: {
      title: "www.example.com",
      url: "www.whatewerworks.in",
    },
    logo: {
      alt: "",
      src: "",
      srcSet: {
        "1x": "",
        "2x": "",
        "3x": "",
      },
      width: 1,
      height: 1,
    },
    tags: ["incubator", "innovation", "iot", "germany"],
  },
};

const documentsData = [
  {
    name: "section name",
    documents: [
      {
        name: "test file",
        url: "test.doc"
      },
      {
        name: "test file",
        url: "test.pdf"
      },
      {
        name: "test file",
        url: "test.doc"
      },
      {
        name: "test file",
        url: "test.pdf"
      },
    ],
  },
  {
    name: "section name",
    documents: [
      {
        name: "test file",
        url: "test.pdf"
      },
      {
        name: "test file",
        url: "test.doc"
      },
      {
        name: "test file",
        url: "test.doc"
      },
      {
        name: "test file",
        url: "test.pdf"
      },
    ],
  },
];

const tabsData = [
  { text: "Team", path: "/" },
  { text: "Investors", path: "/#a" },
  { text: "Partners", path: "/#b" },
  { text: "Key customers", path: "/#c" },
  { text: "Advisors", path: "/#d" },
];

const sliderSettings: Settings = {
  dots: false,
  infinite: true,
  autoplay: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 3,
  arrows: true,
  responsive: [
    {
      breakpoint: 500,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 900,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
  ],
};

const peopleCarouselData = [
  {
    image: {
      "1x": "",
      "2x": "",
      "3x": "",
    },
    name: "person name",
    title: "person title",
    bio:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Non tenetur, impedit labore vero eum omnis iusto quaerat ea, facere perferendis quae!",
  },
  {
    image: {
      "1x": "",
      "2x": "",
      "3x": "",
    },
    name: "person name",
    title: "person title",
    bio:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Non tenetur, impedit labore vero eum omnis iusto quaerat ea, facere perferendis quae!",
  },
  {
    image: {
      "1x": "",
      "2x": "",
      "3x": "",
    },
    name: "person name",
    title: "person title",
    bio:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Non tenetur, impedit labore vero eum omnis iusto quaerat ea, facere perferendis quae!",
  },
  {
    image: {
      "1x": "",
      "2x": "",
      "3x": "",
    },
    name: "person name",
    title: "person title",
    bio:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Non tenetur, impedit labore vero eum omnis iusto quaerat ea, facere perferendis quae!",
  },
  {
    image: {
      "1x": "",
      "2x": "",
      "3x": "",
    },
    name: "person name",
    title: "person title",
    bio:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Non tenetur, impedit labore vero eum omnis iusto quaerat ea, facere perferendis quae!",
  },
  {
    image: {
      "1x": "",
      "2x": "",
      "3x": "",
    },
    name: "person name",
    title: "person title",
    bio:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Non tenetur, impedit labore vero eum omnis iusto quaerat ea, facere perferendis quae!",
  },
];

interface IProps {
  companyData: any;
  etoData: any;
}

interface ICurrencies {
  [key: string]: string;
}

const CURRENCIES: ICurrencies = {
  eth: "ETH",
  eur_t: "nEUR"
}

const Page: React.SFC<IProps> = ({companyData, etoData}) => {
  return (
    <LayoutAuthorized>
      <Cover
        companyName={companyData.brandName}
        companyOneliner={companyData.companyOneliner}
        companyLogo={{
          alt: companyData.brandName,
          srcSet: {
            "1x": companyData.companyLogo
          }
        }}
        companyBanner={{
          alt: companyData.brandName,
          srcSet: {
            "1x": companyData.companyBanner
          }
        }}
        tags={companyData.categories} />
      <Row>
        <Col className="mb-4">
          <SectionHeader className="mb-4"><FormattedMessage id="eto.form.eto-timeline" /></SectionHeader>
          <EtoOverviewStatus
            cap="HARD CAP: 750M EDT"
            duration="22.02.2018 to 22.5.2019"
            tokensSupply="50000000"
            tokenName="ABC"
            tokenImg={tokenIcon}
            status="book-building"
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12} md={8} className="mb-4">
          <SectionHeader className="mb-4">About</SectionHeader>
          <Panel className="mb-4">
            <p className="mb-4">{companyData.companyDescription}</p>
            <Link to={companyData.companyWebsite || ""} target="_blank">
              {companyData.companyWebsite}
            </Link>
            {/* TODO: add social channels */}
          </Panel>
          <SectionHeader className="mb-4">
            <FormattedMessage id="eto.public-view.legal-information.title"/>
          </SectionHeader>
          <Panel className={styles.legalInformation}>
            <Row>
              <Col>
                <div className={styles.group}>
                  <div className={styles.entry}>
                    <span className={styles.label}>
                      <FormattedMessage id="eto.public-view.legal-information.legal-company-name"/>
                    </span>
                    <span className={styles.value}>{companyData.name}</span>
                  </div>
                  <div className={styles.entry}>
                    <span className={styles.label}>
                      <FormattedMessage id="eto.public-view.legal-information.incorporation-date"/>
                    </span>
                    <span className={styles.value}>{companyData.foundingDate}</span>
                  </div>
                  <div className={styles.entry}>
                    <span className={styles.label}>
                      <FormattedMessage id="eto.public-view.legal-information.registration-number"/>
                    </span>
                    <span className={styles.value}>{companyData.registrationNumber}</span>
                  </div>
                  <div className={styles.entry}>
                    <span className={styles.label}>
                      <FormattedMessage id="eto.public-view.legal-information.number-of-founders"/>
                    </span>
                    <span className={styles.value}>{companyData.numberOfFounders}</span>
                  </div>
                  <div className={styles.entry}>
                    <span className={styles.label}>
                      <FormattedMessage id="eto.public-view.legal-information.number-of-employees"/>
                    </span>
                    <span className={styles.value}>{companyData.numberOfEmployees}</span>
                  </div>
                  <div className={styles.entry}>
                    <span className={styles.label}>
                      <FormattedMessage id="eto.public-view.legal-information.last-founding-amount"/>
                    </span>
                    <span className={styles.value}>{`€ ${companyData.lastFundingSizeEur}`}</span>
                  </div>
                  <div className={styles.entry}>
                    <span className={styles.label}>
                      <FormattedMessage id="eto.public-view.legal-information.last-founding-round"/>
                    </span>
                    <span className={styles.value}>{FUNDING_ROUNDS[companyData.companyStage]}</span>
                  </div>
                </div>
              </Col>
              <Col>
                {/* TODO: Add chart */}
                <div className={styles.group}>
                  <div className={styles.entry}>
                    <span className={styles.label}>
                      <FormattedMessage id="eto.public-view.legal-information.pre-money-valuation"/>
                    </span>
                    <span className={styles.value}>{`€ XX`}</span>
                  </div>
                  <div className={styles.entry}>
                    <span className={styles.label}>
                      <FormattedMessage id="eto.public-view.legal-information.existing-shares"/>
                    </span>
                    <span className={styles.value}>{`XXX`}</span>
                  </div>
                  <div className={styles.entry}>
                    <span className={styles.label}>
                      <FormattedMessage id="eto.public-view.legal-information.minimum-new-shares-to-issue"/>
                    </span>
                    <span className={styles.value}>{`XXX`}</span>
                  </div>
                  <div className={styles.entry}>
                    <span className={styles.label}>
                      <FormattedMessage id="eto.public-view.legal-information.share-nominal"/>
                    </span>
                    <span className={styles.value}>{`XXX`}</span>
                  </div>
                </div>
              </Col>
            </Row>
          </Panel>
        </Col>
        <Col xs={12} md={4} className="mb-4">
          <Video youTubeId="aqz-KE-bpKQ" className="mb-4" />
          <NewsWidget
            isEditable={false}
            activeTab="news"
            news={[]}
          />
          {/* TODO: Add news */}
        </Col>
      </Row>

      <Row>
        <Col className="mb-4">
          <SectionHeader className="mb-4">
            <FormattedMessage id="eto.public-view.token-terms.title"/>
          </SectionHeader>
          <Panel className={styles.tokenTerms}>
              <div className={styles.group}>
                <div className={styles.entry}>
                  <span className={styles.label}>
                  <FormattedMessage id="eto.public-view.token-terms.soft-cap"/>
                  </span>
                  <span className={styles.value}>€ </span>
                </div>
                <div className={styles.entry}>
                  <span className={styles.label}>
                    <FormattedMessage id="eto.public-view.token-terms.hard-cap"/>
                  </span>
                  <span className={styles.value}>€ 2 500 000</span>
                </div>
                <div className={styles.entry}>
                  <span className={styles.label}>
                    <FormattedMessage id="eto.public-view.token-terms.minimum-token-cap"/>
                  </span>
                  <span className={styles.value}>2 500 000</span>
                </div>
                <div className={styles.entry}>
                  <span className={styles.label}>
                  <FormattedMessage id="eto.public-view.token-terms.maximum-token-cap"/>
                  </span>
                  <span className={styles.value}>2 500 000</span>
                </div>
                <div className={styles.entry}>
                  <span className={styles.label}>
                  <FormattedMessage id="eto.public-view.token-terms.token-discount"/>
                    Token Discount for whitelist</span>
                  <span className={styles.value}>{etoData.discount_scheme}</span>
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.group}>
                <div className={styles.entry}>
                  <span className={styles.label}>
                    <FormattedMessage id="eto.public-view.token-terms.tokens-per-share"/>
                  </span>
                  <span className={styles.value}>{etoData.equity_tokens_per_share}</span>
                </div>
                <div className={styles.entry}>
                  <span className={styles.label}>
                    <FormattedMessage id="eto.public-view.token-terms.new-share-price"/>
                  </span>
                  <span className={styles.value}>€ {etoData.share_nominal_value_eur}</span>
                </div>
                <div className={styles.entry}>
                  <span className={styles.label}>
                    <FormattedMessage id="eto.public-view.token-terms.fundraising-currency"/>
                  </span>
                  <span className={styles.value}>{etoData.currencies && etoData.currencies.map((currency: string) => CURRENCIES[currency]).join(" / ")}</span>
                </div>
                <div className={styles.entry}>
                  <span className={styles.label}>
                  <FormattedMessage id="eto.public-view.token-terms.minimum-ticket-size"/>
                  </span>
                  <span className={styles.value}>{etoData.min_ticket_eu}</span>
                </div>
                <div className={styles.entry}>
                  <span className={styles.label}>
                  <FormattedMessage id="eto.public-view.token-terms.maximum-ticket-size"/>
                  </span>
                  <span className={styles.value}><FormattedMessage id="eto.public-view.token-terms.unlimited"/></span>
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.group}>
                <div className={styles.entry}>
                  <span className={styles.label}>
                    <FormattedMessage id="eto.public-view.token-terms.pre-sale-duration"/>
                  </span>
                  <span className={styles.value}>{etoData.whitelist_duration_days} <FormattedMessage id="eto.public-view.token-terms.days"/></span>
                </div>
                <div className={styles.entry}>
                  <span className={styles.label}><FormattedMessage id="eto.public-view.token-terms.public-offer-duration"/></span>
                  <span className={styles.value}>
                    <FormattedMessage id="eto.public-view.token-terms.weeks"/>
                  </span>
                </div>
                <div className={styles.entry}>
                  <span className={styles.label}>
                  <FormattedMessage id="eto.public-view.token-terms.token-transfers"/>
                    Token Transfers after ETO</span>
                  <span className={styles.value}>{etoData.enable_transfer_on_success ? <FormattedMessage id="eto.public-view.token-terms.enabled"/> : <FormattedMessage id="eto.public-view.token-terms.disabled"/>}</span>
                </div>
                <div className={styles.entry}>
                  <span className={styles.label}>Voting rights</span>
                  <span className={styles.value}>{etoData.general_voting_rule === "no_voting_rights" || "negative" ? <FormattedMessage id="eto.public-view.token-terms.disabled"/> : <FormattedMessage id="eto.public-view.token-terms.enabled"/>}</span>
                </div>
                <div className={styles.entry}>
                  <span className={styles.label}><FormattedMessage id="eto.public-view.token-terms.liquidation-preferences"/></span>
                  <span className={styles.value}>{etoData.liquidation_preference_multiplier !== 0 ? <FormattedMessage id="eto.public-view.token-terms.enabled"/> : <FormattedMessage id="eto.public-view.token-terms.disabled"/>}</span>
                </div>
              </div>
          </Panel>
        </Col>
      </Row>

      {/* <Row>
        <Col className="mb-4">
          <Tabs tabs={tabsData} size="large" className="mb-4" />
          <Panel>
            <div className={styles.peopleCarouselWrapper}>
              <Slider {...sliderSettings}>
                {peopleCarouselData.map(({ image, name, title, bio }) => (
                  <div key={name}>
                    <div className={styles.peopleCarouselSlideContent}>
                      <div className={styles.peopleCarouselImage}>
                        <ResponsiveImage srcSet={image} alt={name} />
                      </div>
                      <div>
                        <h4 className={styles.peopleCarouselName}>{name}</h4>
                        <h5 className={styles.peopleCarouselTitle}>{title}</h5>
                        <p className={styles.peopleCarouselBio}>{bio}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </Panel>
        </Col>
      </Row> */}

      <Row>
        <Col xs={12} md={8} className="mb-4">
          <SectionHeader className="mb-4"><FormattedMessage id="eto.public-view.product-vision.title"/></SectionHeader>
          <Panel>
          {console.warn(companyData)}
            <Accordion>
              <AccordionElement title={<FormattedMessage id="eto.form.product-vision.problem-solved" />}>
                <p>{companyData.problemSolved}</p>
              </AccordionElement>
              <AccordionElement title={<FormattedMessage id="eto.form.product-vision.customer-group" />}>
                <p>{companyData.customerGroup}</p>
              </AccordionElement>
              <AccordionElement title={<FormattedMessage id="eto.form.product-vision.product-vision" />}>
                <p>{companyData.productVision}</p>
              </AccordionElement>
              <AccordionElement title={<FormattedMessage id="eto.form.product-vision.inspiration" />}>
                <p>{companyData.inspiration}</p>
              </AccordionElement>
              <AccordionElement title={<FormattedMessage id="eto.form.product-vision.key-product-priorities" />}>
                <p>{companyData.keyProductPriorities}</p>
              </AccordionElement>
              <AccordionElement title={<FormattedMessage id="eto.form.product-vision.use-of-capital" />}>
                <p>{companyData.useOfCapital}</p>
                {/* TODO: Add chart */}
              </AccordionElement>
              <AccordionElement title={<FormattedMessage id="eto.form.product-vision.sales-model" />}>
                <p>{companyData.salesModel}</p>
              </AccordionElement>
              <AccordionElement title={<FormattedMessage id="eto.form.product-vision.marketing-approach" />}>
                <p>{companyData.marketingApproach}</p>
              </AccordionElement>
              <AccordionElement title={<FormattedMessage id="eto.form.product-vision.selling-proposition" />}>
                <p>{companyData.sellingProposition}</p>
              </AccordionElement>
            </Accordion>
          </Panel>
        </Col>
        <Col xs={12} md={4}>
          <SectionHeader className="mb-4">
            <FormattedMessage id="eto.form.documents.title" />
          </SectionHeader>
          <DocumentsWidget className="mb-4" groups={documentsData} />
          {/* TODO: Add media links */}

          <SectionHeader className="mb-4">
            <FormattedMessage id="eto.form.media-links.title" />
          </SectionHeader>
          {/* TODO: Add media links */}
        </Col>
      </Row>
    </LayoutAuthorized>
  );
};

export const EtoPublicViewComponent: React.SFC<IProps> = props => (
  <EtoPublicView {...props} />
);

export const EtoPublicView = compose<React.SFC>(
  appConnect({
    stateToProps: s => ({
      companyData: s.etoFlow.companyData,
      etoData: s.etoFlow.etoData
    }),
  }),
  onEnterAction({
    actionCreator: dispatch => dispatch(actions.etoFlow.loadDataStart())
  }),
)(Page);
