import React, { useEffect, useState } from 'react';
import { Card } from '../../../../../components/common/Card';
import {
  Input,
  InputContainer,
  InputError,
  Label,
  CustomInputHint,
  InputHint
} from '../../../../../components/common/Inputs';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PrimaryButton } from '../../../../../components/common/Button';

const validationSchema = Yup.object().shape({
  tokenSaleAddr: Yup.string().required('Address is required'),
});
const formOptions = { resolver: yupResolver(validationSchema) };
import { getStandardTokenBalance, approveTokenDeployer, checkTokenAllowance, isValidAddress } from '../../../../../services/blockchainService'

export const VerifyToken = ({
  moveToNext,
  sendFormData,
  initTokenAddr,
}: {
  moveToNext: () => void;
  sendFormData: (data: any) => void;
  initTokenAddr: string;
}) => {
  const { register, handleSubmit, setError, formState } = useForm(formOptions);
  const { errors } = formState;
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [isTokenAllowed, setIsTokenAllowed] = useState(false)
  const [totalSupply, setTotalSupply] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTokenValidation: SubmitHandler<any> = async (value) => {
    if (!isError) {
      if (isTokenAllowed) {
        sendFormData(value);
        moveToNext();
      } else {
        await handleApprove(value.tokenSaleAddr)
        setIsTokenAllowed(true)
      }

    } else {
      setError('tokenSaleAddr', { type: 'custom', message: 'Invalid token address' })
    }
  };

  const handleApprove = async (tokenAddr: string) => {
    if (tokenAddr) {
      setIsLoading(true)
      let receipt = await approveTokenDeployer(
        tokenAddr,
        "LAUNCHPAD",
      );
      setIsLoading(false)
    }
  };

  const handleGetTokenBalance = async (address: string) => {
    const isValid = isValidAddress(address)
    if (isValid) {
      setIsLoading(true)
      const res = await getStandardTokenBalance(address)
      setTotalSupply(res?.calc_totalSupply || '')
      setName(res?.tname || '')
      setSymbol(res?.tsymbol || '')
      setError('tokenSaleAddr', { type: 'custom', message: '' })
      setIsError(false)
      const isAllowed = await checkTokenAllowance(address, 'DEPLOYER')
      setIsTokenAllowed(!!isAllowed)
      setIsLoading(false)
    }
    else {
      setError('tokenSaleAddr', { type: 'custom', message: 'Invalid token address' })
      setIsError(true)
    }
  }

  useEffect(() => {
    if (initTokenAddr) {
      handleGetTokenBalance(initTokenAddr)
    }
  }, [])


  return (
    <Card>
      <form onSubmit={handleSubmit(handleTokenValidation)}>
        <InputContainer>
          <Label htmlFor="tokenSaleAddr">Token Address</Label>
          <Input
            placeholder="Ex. 0x81507617417b71fC2d231F187bE4Bd919e572761"
            type="text"
            {...register('tokenSaleAddr', { value: initTokenAddr })}
            name="tokenSaleAddr"
            onChange={event => handleGetTokenBalance(event.target.value)}
          />
          <InputError>{errors.tokenSaleAddr?.message}</InputError>
          <InputHint>Pool creation fee: 0.01 BNB</InputHint>
          {!isError ? <div>
            <CustomInputHint>Token Name: {name}</CustomInputHint>
            <CustomInputHint>Total Supply: {totalSupply}</CustomInputHint>
            <CustomInputHint>Symbol: {symbol}</CustomInputHint>
          </div> : ''}
        </InputContainer>
        <InputContainer className="text-right">
          <PrimaryButton disabled={isLoading} size="small" type="submit">
            {isTokenAllowed ? 'Next' : 'Approve'}
          </PrimaryButton>
        </InputContainer>
      </form>
    </Card>
  );
};
