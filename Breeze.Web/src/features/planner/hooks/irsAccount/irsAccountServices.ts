import useHttp from '@/shared/api/useHttp'

export interface IRSAccount {
	id: number
	type: string
	maxAmount: number
	familyMaxAmount?: number | null
	catchUpAmount: number
	catchUpAge: number
}

export const useIRSAccounts = () => {
	const { getMany } = useHttp()

	const getIRSAccounts = async (): Promise<IRSAccount[]> => await getMany<IRSAccount>('irs-accounts')

	return { getIRSAccounts }
}
