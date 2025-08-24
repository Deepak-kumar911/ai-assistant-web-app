import AgentInfo from './AgentInfo';
import AgentWidgetCustomization from './AgentWidgetCustomization';

export default function AgentCustomization({details}) {
  return (
    <div className="p-3 rounded-lg shadow">
      <AgentInfo details={details}/>
       <br/><hr/>
      <AgentWidgetCustomization details={details}/>
    </div>
  );
}
