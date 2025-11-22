import React from 'react';

interface StatusBadgeProps {
    status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
            case 'waiting': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'ready': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'done': return 'bg-green-500/10 text-green-400 border-green-500/30';
            case 'canceled': return 'bg-red-500/10 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    return (
        <span className={`text-xs px-2 py-1 rounded border capitalize ${getStatusColor(status)}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
