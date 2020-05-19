

export const generateCampaigningValidation = (minPledge: number, maxPledge?: number) =>
  Yup.object({
    amount: Yup.string()
      .required()
      .matches(
        /^[0-9]*$/,
        getMessageTranslation(createMessage(ValidationMessage.VALIDATION_INTEGER)) as any,
      )
      .test(isPledgeAboveMinimum(minPledge))
      .test(isPledgeNotAboveMaximum(maxPledge)),
  });