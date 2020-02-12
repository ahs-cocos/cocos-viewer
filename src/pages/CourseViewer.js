import React, {useState, useEffect, useRef} from 'react'
import PropTypes from 'prop-types'
import CourseViewerOutline from "../component/CourseViewerOutline";
import {Header, Divider} from "semantic-ui-react";
import {CocosHeader, CommentComp, CommentContext} from "cocos-lib";

const Parser = require('html-react-parser')

const COMMENT_TIMER_TIMEOUT = 3000

const CourseViewer = ({courseService, commentService, course, cocosUser, publication, version, consumerVars}) => {

    console.log('CONSUMER VARS', consumerVars)
    const contentRef = useRef(null)

    const [previewData, setPreviewData] = useState()
    const [comments, setComments] = useState()
    const [selectedOutlineItem, setSelectedOutlineItem] = useState()

    useEffect(() => {
        const id = setInterval(updateComments, COMMENT_TIMER_TIMEOUT)

        return () => clearInterval(id)
    }, [])

    useEffect(() => {
        commentService.getComments(course).then(res => {
            setComments(res)
            console.log('COMM', res)
        })
    }, [course, commentService])

    useEffect(() => {
        console.log('REF', contentRef)
        if (!contentRef.current) return
        console.log('REF', contentRef)
        contentRef.current.addEventListener("scroll", onScroll);
        return () => {
            contentRef.current.removeEventListener("scroll", onScroll);
        }
    }, [previewData])

    useEffect(() => {
        courseService.getPreviewData(version).then(res => {
            console.log('PD', res)
            setPreviewData(res)
        })
    }, [])

    const updateComments = () => {
        commentService.getComments(course).then(res => {
            if (res) setComments(res)
        })
    }

    const onScroll = (event) => {
        //console.log('SCROLLING', event.target)
    }

    const onOutlineItemSelect = (outlineItem) => {
        console.log('SEL OI', outlineItem)
        setSelectedOutlineItem(outlineItem)
    }

    const createComment = (comment) => {
        if (!comment.author_display_name || comment.author_display_name === '')
            comment.author_display_name = cocosUser.email

        comment.contextDetail = consumerVars.tool_consumer_info_product_family_code + ' - ' + consumerVars.tool_consumer_instance_name

        commentService.createComment(comment).then(res => {
            console.log('COMMENT', res, cocosUser)
            setComments([res, ...comments])
        })
    }

    const deleteComment = (comment) => {

        const answer = window.confirm('Are you sure you want to delete this comment?')

        if (answer) {
            commentService.deleteComment(comment).then(res => {
                setComments(comments.filter(c => c.id !== comment.id))
            })
        }
    }

    return (
        <div className="flex-container">


            <CourseViewerOutline course={course}
                                 publication={publication}
                                 onOutlineItemSelect={onOutlineItemSelect}/>

            {previewData && <div ref={contentRef} className='editor-center-column'>
                <div>
                    {Parser(previewData)}</div>
            </div>}

            <div className='editor-right-column'>
                <Header>Comments</Header>
                <Divider style={{marginTop: 0}}/>
                {selectedOutlineItem && <CommentComp comments={comments}
                                                     outline={selectedOutlineItem}
                                                     course={course}
                                                     context={CommentContext.VIEWER}
                                                     commentService={commentService}
                                                     cocosUser={cocosUser}
                                                     createComment={createComment}
                                                     deleteComment={deleteComment}/>}
            </div>
        </div>
    )
}

export default CourseViewer

CourseViewer.propTypes = {
    courseService: PropTypes.object.isRequired,
    commentService: PropTypes.object.isRequired,
    course: PropTypes.object.isRequired,
    cocosUser: PropTypes.object.isRequired,
    publication: PropTypes.object.isRequired,
    version: PropTypes.object.isRequired,
    consumerVars: PropTypes.object.isRequired,
}

CourseViewer.defaultProps = {}