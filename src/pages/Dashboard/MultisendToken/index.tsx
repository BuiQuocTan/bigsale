import { useMemo, useState } from "react";
import { Stepper, Step } from "react-form-stepper";
import AddAllocation, { TxData } from "./AddAllocation";
import Confirmation from "./Confirmation";

const StepConfigStyle = {
  activeBgColor: "#5D00FF",
  activeTextColor: "white",
  completedBgColor: "white",
  completedTextColor: "#5D00FF",
  inactiveBgColor: "white",
  inactiveTextColor: "gray",
  size: 32,
  circleFontSize: 18,
  labelFontSize: 16,
  borderRadius: "50%",
  fontWeight: 400,
  position: "relative",
};

const MultisendToken = () => {
  const [activeStep, setActiveStep] = useState(MULTI_SEND_STEP.addAllocation);
  const [data, setData] = useState<TxData>({
    allocationInfo: [],
    tokenInfo: {},
    totalSendValue: 0,
    tokenAddress: "",
  });

  const isInitialStep = useMemo(
    () => activeStep === MULTI_SEND_STEP.addAllocation,
    [activeStep]
  );

  return (
    <>
      <Stepper activeStep={activeStep}>
        <Step label="Add Your Allocation" styleConfig={StepConfigStyle} />
        <Step label="Confirmation" styleConfig={StepConfigStyle} />
      </Stepper>
      {isInitialStep ? (
        <AddAllocation
          onGoToNextStep={(value) => {
            setActiveStep(MULTI_SEND_STEP.confirmation);
            setData(value);
          }}
        />
      ) : (
        <Confirmation
          data={data}
          onGoBack={() => setActiveStep(MULTI_SEND_STEP.addAllocation)}
        />
      )}
    </>
  );
};

export default MultisendToken;

const MULTI_SEND_STEP = {
  addAllocation: 0,
  confirmation: 1,
};
