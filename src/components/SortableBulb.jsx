import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LightControls from './lightControls';

function SortableBulb({ bulb, ...props }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: bulb.mac });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <LightControls
                bulb={bulb}
                dragHandleProps={{ ...attributes, ...listeners }}
                {...props}
            />
        </div>
    );
}

export default SortableBulb;