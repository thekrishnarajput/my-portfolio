import { useState, useEffect } from 'react';

interface TypewriterProps {
    text: string;
    speed?: number;
    deleteSpeed?: number;
    delayBeforeDelete?: number;
    className?: string;
    showCursor?: boolean;
    onComplete?: () => void;
    repeat?: boolean;
}

const Typewriter = ({
    text,
    speed = 100,
    deleteSpeed = 80,
    delayBeforeDelete = 3000,
    className = '',
    showCursor = true,
    onComplete,
    repeat = true
}: TypewriterProps) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!isDeleting && currentIndex < text.length) {
            // Typing forward
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (!isDeleting && currentIndex >= text.length && !isComplete) {
            // Finished typing, wait before deleting
            const timeout = setTimeout(() => {
                if (repeat) {
                    setIsDeleting(true);
                } else {
                    setIsComplete(true);
                    if (onComplete) {
                        onComplete();
                    }
                }
            }, delayBeforeDelete);

            return () => clearTimeout(timeout);
        } else if (isDeleting && displayedText.length > 0) {
            // Deleting backward
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev.slice(0, -1));
            }, deleteSpeed);

            return () => clearTimeout(timeout);
        } else if (isDeleting && displayedText.length === 0) {
            // Finished deleting, restart typing
            setIsDeleting(false);
            setCurrentIndex(0);
        }
    }, [currentIndex, text, speed, deleteSpeed, delayBeforeDelete, isDeleting, displayedText, isComplete, repeat, onComplete]);

    return (
        <>
            <span className={className}>
                {displayedText}
            </span>
            {showCursor && (
                <span className="text-primary-600 dark:text-primary-400 animate-pulse ml-1">|</span>
            )}
        </>
    );
};

export default Typewriter;

