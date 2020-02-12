import React, {useState, useEffect, Fragment} from 'react'
import PropTypes from 'prop-types'
import OutlineItem from "./OutlineItem";

const INDENT = 20

const CourseViewerOutline = ({course, publication, onOutlineItemSelect}) => {

    const [outline, setOutline] = useState(course.outline)
    const [outlineLookup, setOutlineLookup] = useState()
    const [selectedOutlineItem, setSelectedOutlineItem] = useState()

    useEffect(() => {
        const flat = buildOutline(course.outline, 0, [], 0, publication.outline_ids.split(',').map(id => parseInt(id)))
        console.log('FLAT', flat)
        const lookup = {}
        for (const flatElement of flat) {
            lookup[flatElement.id] = flatElement
        }

        setOutlineLookup(lookup)

    }, [])

    const onItemClick = (outlineItem) => {
        if (selectedOutlineItem) selectedOutlineItem.selected = false
        outlineItem.selected = true
        outlineItem.status = outlineItem.status === 'open' ? 'open' : 'open'
        setSelectedOutlineItem(outlineItem)
        setOutline([...outline])
        onOutlineItemSelect(outlineItem)
    }

    const buildOutline = (base, indent, flatList, parentId, allowedIds) => {

        for (const baseElement of base) {
            //if (allowedIds.indexOf(baseElement.id === -1)) continue
            const allowed = allowedIds.indexOf(baseElement.id) > -1
            baseElement.indent = indent
            baseElement.parentId = parentId
            baseElement.status = 'open'
            baseElement.allowed = allowed
            flatList.push(baseElement)
            if (baseElement.children) {
                buildOutline(baseElement.children, indent + INDENT, flatList, baseElement.id, allowedIds)
            }
        }

        return flatList
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
    course: PropTypes.object.isRequired,
    publication: PropTypes.object.isRequired,
    onOutlineItemSelect: PropTypes.func
}

CourseViewerOutline.defaultProps = {}