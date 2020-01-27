import React, {useState, useEffect, Fragment} from 'react'
import PropTypes from 'prop-types'
import OutlineItem from "./OutlineItem";
const INDENT = 20

const CourseViewerOutline = ({course}) => {

    const [outline, setOutline] = useState(course.outline)
    const [outlineLookup, setOutlineLookup] = useState()
    const [selectedOutlineItem, setSelectedOutlineItem] = useState()

    useEffect(() => {
        const flat = buildOutline(course.outline, 0, [], 0)
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
    }

    const buildOutline = (base, indent, flatList, parentId) => {

        for (const baseElement of base) {
            baseElement.indent = indent
            baseElement.parentId = parentId
            baseElement.status = 'open'
            flatList.push(baseElement)
            if (baseElement.children){
                buildOutline(baseElement.children, indent + INDENT, flatList, baseElement.id)
            }
        }

        return flatList
    }

    console.log('OUTLINE', outline)
    return (
        <Fragment>
            <div style={{padding: '10px'}}>
                {outline.map((el, index) => {
                    return <OutlineItem key={index} element={el} onItemClick={onItemClick} selectedOutlineItem={selectedOutlineItem}/>
                })}
            </div>
        </Fragment>
    )
}

export default  CourseViewerOutline

CourseViewerOutline.propTypes = {
    course: PropTypes.object.isRequired
}

CourseViewerOutline.defaultProps = {

}