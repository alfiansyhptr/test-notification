import { AppRouter } from './routes';
import { NotificationPermission } from './components/NotificationPermission';
import { NotificationToast } from './components/NotificationToast';

function App() {
  return (
    <>
      <div className="max-w-4xl mx-auto p-4">
        <NotificationPermission />
      </div>
      <NotificationToast />
      <AppRouter />
    </>
  );
}

export default App;
