"use client";

import { DragDropContext } from "@hello-pangea/dnd";
import KanbanColumn from "./KanbanColumn";
import { useState, useRef, useEffect } from "react";

const COLUMNS = [
  { id: "Applied", title: "Applied" },
  { id: "Interviewing", title: "Interviewing" },
  { id: "On Hold", title: "On Hold" },
  { id: "Offer", title: "Offer" },
  { id: "Joined", title: "Joined" },
  { id: "Rejected", title: "Rejected" },
  { id: "Withdrawn", title: "Withdrawn" },
  { id: "Ghosted", title: "Ghosted" },
];

export default function KanbanBoard({ applications, onStatusChange, onClickApplication }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Manual auto-scroll logic
  const isDragging = useRef(false);
  const mouseX = useRef(0);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging.current) {
        mouseX.current = e.clientX;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrame;
    const scrollLoop = () => {
      if (isDragging.current && scrollRef.current) {
        const { left, right } = scrollRef.current.getBoundingClientRect();
        const threshold = 150; // pixels from edge to trigger scroll
        const speed = 12;

        if (mouseX.current > 0 && mouseX.current < left + threshold) {
          scrollRef.current.scrollBy({ left: -speed });
        } else if (mouseX.current > 0 && mouseX.current > right - threshold) {
          scrollRef.current.scrollBy({ left: speed });
        }
      }
      animationFrame = requestAnimationFrame(scrollLoop);
    };
    scrollLoop();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Group applications by status
  const grouped = {};
  for (const col of COLUMNS) {
    grouped[col.id] = [];
  }
  for (const app of applications) {
    const status = app.status || "Applied";
    if (grouped[status]) {
      grouped[status].push(app);
    } else {
      grouped["Applied"].push(app);
    }
  }

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = (result) => {
    isDragging.current = false;
    mouseX.current = 0;
    
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    onStatusChange(draggableId, newStatus);
  };

  const handleScrollClick = (amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group w-full">
      {/* Left Fade & Arrow */}
      {canScrollLeft && (
        <div 
          className="absolute left-0 top-0 bottom-6 w-24 bg-gradient-to-r from-gray-50 to-transparent flex items-center justify-start px-2 z-10 pointer-events-none transition-opacity"
        >
          <button 
            onClick={() => handleScrollClick(-300)}
            className="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-lg pointer-events-auto hover:bg-yellow-500 hover:scale-105 transition-all border-2 border-black"
            aria-label="Scroll left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      )}

      {/* Right Fade & Arrow */}
      {canScrollRight && (
        <div 
          className="absolute right-0 top-0 bottom-6 w-24 bg-gradient-to-l from-gray-50 to-transparent flex items-center justify-end px-2 z-10 pointer-events-none transition-opacity"
        >
          <button 
            onClick={() => handleScrollClick(300)}
            className="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-lg pointer-events-auto hover:bg-yellow-500 hover:scale-105 transition-all border-2 border-black animate-pulse-slow"
            aria-label="Scroll right"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="pipeline-board relative"
        >
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              columnId={col.id}
              title={col.title}
              applications={grouped[col.id]}
              onClickApplication={onClickApplication}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
