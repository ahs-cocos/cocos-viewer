import React, {useState} from 'react'
import PropTypes from 'prop-types'
import CourseViewerOutline from "../component/CourseViewerOutline";

const CourseViewer = ({course}) => {

    return (
        <div>
            <CourseViewerOutline course={course}/>
        </div>
    )
}

export default  CourseViewer

CourseViewer.propTypes = {
    course: PropTypes.object.isRequired
}

CourseViewer.defaultProps = {

}