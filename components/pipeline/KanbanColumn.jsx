"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import ApplicationCard from "./ApplicationCard";

export default function KanbanColumn({ columnId, title, applications, onClickApplication }) {
  return (
    <div className="pipeline-column">
      <div className="pipeline-column-header">
        <h3>{title}</h3>
        <span className="pipeline-column-count">{applications.length}</span>
      </div>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="pipeline-column-body"
            style={{
              background: snapshot.isDraggingOver ? "rgba(250, 204, 21, 0.06)" : undefined,
              transition: "background 0.2s ease",
            }}
          >
            {applications.map((app, index) => (
              <Draggable key={app.id} draggableId={app.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <ApplicationCard
                    application={app}
                    provided={dragProvided}
                    isDragging={dragSnapshot.isDragging}
                    onClick={onClickApplication}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {applications.length === 0 && !snapshot.isDraggingOver && (
              <div style={{ padding: "1.5rem 0.5rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>No applications</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
