import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Calendar, CheckCircle, Clock, Circle } from 'lucide-react';
import './ActivityNode.css';

// React Flow passes data as a prop
export default function ActivityNode({ data }: { data: any }) {
    const { activity } = data;

    const getStatusIcon = () => {
        switch (activity.status) {
            case 'completed': return <CheckCircle size={14} className="node-icon success" />;
            case 'active': return <Clock size={14} className="node-icon warning" />;
            case 'pending': default: return <Circle size={14} className="node-icon neutral" />;
        }
    };

    return (
        <div className={`activity-node ${activity.status}`}>
            <Handle type="target" position={Position.Left} className="node-handle" />

            <div className="node-header">
                <span className="node-id">{activity.id}</span>
                {getStatusIcon()}
            </div>

            <div className="node-body">
                <span className="node-name">{activity.name}</span>
            </div>

            <div className="node-footer">
                <Calendar size={12} />
                <span>{new Date(activity.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(activity.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>

            <Handle type="source" position={Position.Right} className="node-handle" />
        </div>
    );
}
