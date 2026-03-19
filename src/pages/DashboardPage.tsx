import { Balance } from '@/components/organisms/Balance';
import { TransactionList } from '@/components/organisms/TransactionList';
import { TransactionModal } from '@/components/organisms/TransactionModal';

export const DashboardPage = () => {
  return (
    <>
      <TransactionList />
      <TransactionModal />
      <Balance />
    </>
  );
};