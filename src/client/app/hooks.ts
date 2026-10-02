import { useDispatch } from 'react-redux'
import { AllThunkDispatch } from './actions/types'

const useAppDispatch = () => useDispatch<AllThunkDispatch>()

export default useAppDispatch
