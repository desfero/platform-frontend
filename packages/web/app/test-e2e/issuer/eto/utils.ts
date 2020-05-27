import { formatThousands } from "../../../components/shared/formatters/utils";
import { getJwtToken } from "../../utils";
import { fillForm } from "../../utils/forms";
import { confirmAccessModal, tid } from "../../utils/index";

const COMPANIES_ME_PATH = "/api/eto-listing/companies/me";
const ETOS_ME_PATH = "/api/eto-listing/etos/me";

export const pushEtoToAPI = () => {
  cy.request({
    method: "PUT",
    url: COMPANIES_ME_PATH,
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${getJwtToken()}`,
    },
    body: {
      brand_name: "Davecoin",
      city: "Berlin",
      company_description: "<p>..also Beer!</p>",
      company_id: "0xAe9B8dC0d93f9B5c0F445BAB012FDd517C66D434",
      company_legal_description: "Sunt elogiumes fallere camerarius, emeritis tabeses.",
      company_oneliner: "Free icecream for all",
      company_pitchdeck_url: {
        title: "Pitch Deck",
        url: "https://neufund.org/cms_resources/whitepaper.pdf",
      },
      company_preview_card_banner:
        "https://documents.neufund.io/0xAe9B8dC0d93f9B5c0F445BAB012FDd517C66D434/9753cce4-934f-4847-b148-72f1a0b0d86c.png",
      company_share_capital: 5000,
      company_slideshare: {
        title: "",
        url: "https://neufund.org/",
      },
      company_video: {
        title: "",
        url: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
      },
      company_website: "https://neufund.org",
      country: "DE",
      etos: [],
      founding_date: "1999-02-22",
      jurisdiction: "DE",
      key_quote_founder: "Let's make it a great day.",
      legal_form: "GmbH",
      name: "Fifth Force",
      registration_number: "1234",
      risk_no_loans_exist: true,
      risk_no_third_party_dependency: true,
      risk_not_regulated_business: true,
      schema_version: 2,
      share_capital_currency_code: "EUR",
      shareholders: [
        {
          full_name: "Marcin Rudolf",
          share_capital: 90,
        },
      ],
      social_channels: [
        {
          type: "twitter",
          url: "",
        },
        {
          type: "facebook",
          url: "",
        },
        {
          type: "linkedin",
          url: "",
        },
        {
          type: "slack",
          url: "",
        },
        {
          type: "medium",
          url: "",
        },
        {
          type: "reddit",
          url: "",
        },
        {
          type: "telegram",
          url: "",
        },
        {
          type: "github",
          url: "",
        },
        {
          type: "instagram",
          url: "",
        },
        {
          type: "gplus",
          url: "",
        },
        {
          type: "youtube",
          url: "",
        },
        {
          type: "xing",
          url: "",
        },
        {
          type: "bitcointalk",
          url: "",
        },
      ],
      street: "Cuvrystr 6",
      use_of_capital: "<p>Cash is all around me</p>",
      use_of_capital_list: [
        {
          description: "Food",
          percent: 0.35,
        },
        {
          description: "Yoga",
          percent: 0.65,
        },
      ],
      zip_code: "12345",
    },
  });
};

export const pushEtoDataToAPI = () => {
  cy.request({
    method: "PUT",
    url: ETOS_ME_PATH,
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${getJwtToken()}`,
    },
    body: {
      advisory_board: "asdfasdf",
      can_enable_bookbuilding: false,
      claim_duration_days: 10,
      company_id: "0xAe9B8dC0d93f9B5c0F445BAB012FDd517C66D434",
      currencies: ["eth", "eur_t"],
      documents: {
        QmWSaSKGjYEgt6nrQjpXKzLUFV4Fp9W7HEwTsdxN8vAYyV: {
          document_type: "signed_termsheet",
          form: "document",
          ipfs_hash: "QmWSaSKGjYEgt6nrQjpXKzLUFV4Fp9W7HEwTsdxN8vAYyV",
          mime_type: "application/pdf",
          name: "example.pdf",
        },
      },
      enable_transfer_on_success: true,
      equity_token_image:
        "https://documents.neufund.io/0xAe9B8dC0d93f9B5c0F445BAB012FDd517C66D434/caeca42c-24a6-4dd7-984b-5ffb988e766f.png",
      equity_token_name: "Sharpcoin",
      equity_token_precision: 0,
      equity_token_symbol: "X#C",
      equity_tokens_per_share: 1000,
      eto_id: "0xAe9B8dC0d93f9B5c0F445BAB012FDd517C66D434",
      existing_share_capital: 1253862,
      general_voting_duration_days: 11,
      general_voting_rule: "positive",
      has_dividend_rights: true,
      has_drag_along_rights: true,
      has_founders_vesting: false,
      has_general_information_rights: true,
      has_tag_along_rights: true,
      investment_calculated_values: {
        can_be_listed: true,
        can_go_on_chain: false,
        discounted_share_price: 119.630389947219071955,
        effective_max_ticket: 2345693.904113849849504969,
        equity_tokens_per_share: 1000,
        eto_terms: {
          company: "0xAe9B8dC0d93f9B5c0F445BAB012FDd517C66D434",
          duration_terms: {
            CLAIM_DURATION: "864000",
            PUBLIC_DURATION: "1209600",
            SIGNING_DURATION: "1296000",
            WHITELIST_DURATION: "432000",
          },
          eto_terms: {
            ENABLE_TRANSFERS_ON_SUCCESS: true,
            ETO_TERMS_CONSTRAINTS: "0xC8fC26967Db8b6D1784c8e80f35de96f366FA7d4",
            EXISTING_SHARE_CAPITAL: "1253862000000000000000000",
            MAX_TICKET_EUR_ULPS: "2345693904113849849504969",
            MIN_TICKET_EUR_ULPS: "1000000000000000000000",
            PUBLIC_DISCOUNT_FRAC: "0",
            SHARE_CAPITAL_CURRENCY_CODE: "EUR",
            WHITELIST_DISCOUNT_FRAC: "0",
          },
          nominee: "0xC6CD8b540549BCeCd050CFd07dCE7eaeF9BB1C23",
          tokenholder_rights: {
            GENERAL_VOTING_DURATION: "950400",
            GENERAL_VOTING_RULE: "1",
            HAS_FOUNDERS_VESTING: false,
            LIQUIDATION_PREFERENCE_MULTIPLIER_FRAC: "2000000000000000000",
            RESTRICTED_ACT_VOTING_DURATION: "1296000",
            SHAREHOLDERS_VOTING_QUORUM_FRAC: "450000000000000000",
            TAG_ALONG_VOTING_RULE: "2",
            VOTING_FINALIZATION_DURATION: "1036800",
            VOTING_MAJORITY_FRAC: "500000000000000000",
          },
          token_terms: {
            EQUITY_TOKENS_PER_SHARE: "1000",
            EQUITY_TOKEN_NAME: "Sharpcoin",
            EQUITY_TOKEN_SYMBOL: "X#C",
            MAX_NUMBER_OF_TOKENS: "20000000",
            MAX_NUMBER_OF_TOKENS_IN_WHITELIST: "20000000",
            MIN_NUMBER_OF_TOKENS: "10000000",
            SHARE_NOMINAL_VALUE_EUR_ULPS: "150000000000000000000",
            SHARE_NOMINAL_VALUE_ULPS: "150000000000000000000",
            TOKEN_PRICE_EUR_ULPS: "119630389947219072",
          },
        },
        fixed_slots_min_share_price: 119.630389947219071955,
        max_available_tokens: 19607843,
        max_available_tokens_in_fixed_slots: 19607843,
        max_available_tokens_in_whitelist: 19607843,
        max_investment_amount: 2345693.904113849849504969,
        max_investment_amount_with_all_discounts: 2345693.904113849849504969,
        min_investment_amount: 1196303.899472190719552869,
        public_share_price: 119.630389947219071955,
        share_price: 119.630389947219071955,
      },
      is_bookbuilding: false,
      is_featured: false,
      is_marketing_data_visible_in_preview: "not_visible",
      liquidation_preference_multiplier: 2,
      max_pledges: 500,
      min_ticket_eur: 1000,
      minimum_new_shares_to_issue: 10000,
      new_share_nominal_value: 150,
      new_share_nominal_value_eur: 150,
      new_shares_to_issue: 20000,
      nominee: "0xC6CD8b540549BCeCd050CFd07dCE7eaeF9BB1C23",
      nominee_display_name: "Fifth Force",
      pre_money_valuation_eur: 1000000,
      preview_code: "7ab75714-a649-43f2-ad12-4753f8e22c83",
      product: {
        asset_type: "security",
        available: true,
        can_set_transferability: true,
        date_to_whitelist_min_duration: 28800,
        has_nominee: true,
        id: "0xC8fC26967Db8b6D1784c8e80f35de96f366FA7d4",
        jurisdiction: "LI",
        max_claim_duration_days: 30,
        max_investment_amount: 5000000,
        max_offer_duration_days: 90,
        max_public_duration_days: 60,
        max_signing_duration_days: 60,
        max_ticket_size: 0.0,
        max_whitelist_duration_days: 30,
        min_claim_duration_days: 0,
        min_investment_amount: 0.0,
        min_offer_duration_days: 1,
        min_public_duration_days: 0,
        min_signing_duration_days: 14,
        min_ticket_size: 10,
        min_whitelist_duration_days: 0,
        name: "mini eto li",
        offering_document_subtype: "regular",
        offering_document_type: "memorandum",
        schema_version: 1,
        token_offering_operator: "0xC35ef5DA2607C70D812cA2F317E9958910450dF1",
      },
      product_id: "0xC8fC26967Db8b6D1784c8e80f35de96f366FA7d4",
      prospectus_language: "en",
      public_duration_days: 14,
      restricted_act_voting_duration_days: 15,
      schema_version: 2,
      share_capital_currency_code: "EUR",
      shareholders_voting_quorum: 0.45,
      signing_duration_days: 15,
      state: "preview",
      tag_along_voting_rule: "negative",
      templates: {
        company_token_holder_agreement: {
          document_type: "company_token_holder_agreement",
          form: "template",
          ipfs_hash: "QmQkpDFpWLiQh8pQeYteuEn29LphtP4t4gnXDpuHAxAwy5",
          local_override: false,
          mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          name: "company_token_holder_agreement_en_SECURITY",
        },
        investment_memorandum_template: {
          document_type: "investment_memorandum_template",
          form: "template",
          ipfs_hash: "QmeNnF7XPADdrztHFbPjjcEVcCnGo7ghEgvc3ZtMaJ1DoQ",
          local_override: false,
          mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          name: "investment_memorandum_template_en",
        },
        investment_summary_template: {
          document_type: "investment_summary_template",
          form: "template",
          ipfs_hash: "QmegsyUKEvJedsMnTCEn4AMNpkjoDvawunF1CseNbCLkiV",
          local_override: false,
          mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          name: "investment_summary_template_en",
        },
        reservation_and_acquisition_agreement: {
          document_type: "reservation_and_acquisition_agreement",
          form: "template",
          ipfs_hash: "QmafFp3pbFRymDG9fmY3y2ZTYcQcsRftpDXVT4jgdLM2rk",
          local_override: false,
          mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          name: "reservation_and_acquisition_agreement_en",
        },
        termsheet_template: {
          document_type: "termsheet_template",
          form: "template",
          ipfs_hash: "QmTYs6r2MtZ1ckZgH6vXRfLPuq3wB93RhUkPF5fP9BRtTd",
          local_override: false,
          mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          name: "termsheet_template_en",
        },
      },
      token_tradeable_on_success: false,
      voting_finalization_duration_days: 12,
      voting_majority_fraction: 0.5,
      whitelist_duration_days: 5,
    },
  });
};

export const submitBookBuilding = (
  amount: string,
  consentToRevealEmail: boolean,
  shouldConfirmModal: boolean = true,
) => {
  fillForm({
    amount,
    consentToRevealEmail: {
      type: "toggle",
      checked: consentToRevealEmail,
    },
    "eto-bookbuilding-commit": {
      type: "submit",
    },
  });

  if (shouldConfirmModal) {
    confirmAccessModal();
  }

  cy.get(tid("campaigning-your-commitment")).contains(`${formatThousands(amount)} EUR`);
};
