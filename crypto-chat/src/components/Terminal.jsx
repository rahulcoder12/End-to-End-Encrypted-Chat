// src/components/Terminal.jsx

export default function Terminal({ logs }) {
  return (
    <div className="w-1/4 bg-black border-l border-[#202c33] p-4 font-mono text-xs text-green-500 overflow-y-auto z-10 shadow-2xl">
      <h2 className="text-sm font-bold mb-4 text-gray-500 uppercase tracking-widest">System Terminal</h2>
      <div className="flex flex-col gap-1">
        {logs.map((log, index) => (
          <div key={index} className={log.includes('CRITICAL') ? 'text-[#ffd02c] font-bold' : ''}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}