import React, {useState, useEffect, Fragment} from 'react'
import PropTypes from 'prop-types'
import OutlineItem from "./OutlineItem";


const CourseViewerOutline = ({outline, onOutlineItemSelect}) => {

    const [selectedOutlineItem, setSelectedOutlineItem] = useState()


    const onItemClick = (outlineItem) => {
        if (selectedOutlineItem) selectedOutlineItem.selected = false
        outlineItem.selected = true
        outlineItem.status = outlineItem.status === 'open' ? 'open' : 'open'
        setSelectedOutlineItem(outlineItem)
        onOutlineItemSelect(outlineItem)
    }

    return (
        <Fragment>
            <div className='viewer-outline'>
                {outline.map((el, index) => {
                    return <OutlineItem key={index} element={el} onItemClick={onItemClick} selectedOutlineItem={selectedOutlineItem}/>
                })}
            </div>
        </Fragment>
    )
}

export default CourseViewerOutline

CourseViewerOutline.propTypes = {
    onOutlineItemSelect: PropTypes.func
}

CourseViewerOutline.defaultProps = {}