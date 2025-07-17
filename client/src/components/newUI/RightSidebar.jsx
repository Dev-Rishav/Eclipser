import AccentThree from './AccentThree';
import ChatCard from './ChatCard';
import OptionalCard from './Status';

const RightSidebar = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AccentThree />
      </div>
      <div className="flex justify-end">
        <ChatCard />
      </div>
      <div className="flex justify-end">
        <OptionalCard />
      </div>
    </div>
  );
};

export default RightSidebar;