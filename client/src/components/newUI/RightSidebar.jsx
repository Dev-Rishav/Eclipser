import AccentThree from './AccentThree';
import ChatCard from './ChatCard';
import OptionalCard from './Status';

const RightSidebar = () => {
  return (
    <div className="space-y-4 w-full">
      <div className="w-full">
        <AccentThree />
      </div>
      <div className="w-full">
        <ChatCard />
      </div>
      <div className="w-full">
        <OptionalCard />
      </div>
    </div>
  );
};

export default RightSidebar;