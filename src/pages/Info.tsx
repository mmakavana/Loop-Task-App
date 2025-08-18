export default function InfoPage(){
  return (<div className="card space-y-2"><h3 className="font-semibold">Welcome to Loop</h3>
    <p>Loop is a family task tracker that helps parents assign tasks, track daily completion, and reward progress.</p>
    <ul className="list-disc pl-6 space-y-1">
      <li><b>Board:</b> Check off each child’s tasks for the selected day.</li>
      <li><b>Calendar:</b> ⭐ appears when all tasks are done; keep the streak going!</li>
      <li><b>Manage:</b> Add kids and tasks. PIN-lock keeps settings safe.</li>
      <li><b>Reports:</b> Summary + three logs (Adjustments, Streak Bonuses, Payouts). Actions are PIN-protected.</li>
    </ul>
    <p>Why some days have no tasks? Tasks only show on the weekdays you assign.</p>
    <p>Tip: Export your data in Manage → Settings to back it up.</p>
  </div>)
}
