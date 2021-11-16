import React, {useState, useEffect, useRef} from 'react'
import PropTypes from 'prop-types'
import CourseViewerOutline from "../component/CourseViewerOutline";
import {Header, Divider} from "semantic-ui-react";
import {CocosHeader, CommentComp, CommentContext} from "cocos-lib";

const Parser = require('html-react-parser')

const COMMENT_TIMER_TIMEOUT = 3000
const INDENT = 20

const CourseViewer = ({courseService, commentService, course, cocosUser, publication, version, consumerVars}) => {

    console.log('CONSUMER VARS', consumerVars)
    const contentRef = useRef(null)
    const [outline, setOutline] = useState(course.outline)
    const [outlineLookup, setOutlineLookup] = useState()
    const [previewData, setPreviewData] = useState()
    const [comments, setComments] = useState()
    const [selectedOutlineItem, setSelectedOutlineItem] = useState()
    const [selectedOutlineId, setSelectedOutlineId] = useState(0)
    const [scrollPos, setScrollPos] = useState()
    const [settings, setSettings] = useState({})

    /*useEffect(() => {
        window.onhashchange = (evt) => {
            console.log('HASH CHANGE', evt)
        }
    }, [])*/

    /*useEffect(() => {
        if (!outlineLookup) return
        const oi = outlineLookup[selectedOutlineId]
        if (selectedOutlineItem) selectedOutlineItem.selected = false
        oi.selected = true
        console.log('SCROLLPOS', oi)
    }, [selectedOutlineId])*/

    useEffect(() => {
        if (!publication) return
        setSettings(publication.settings && JSON.parse(publication.settings))
    }, [publication])

    useEffect(() => {
        const flat = buildOutline(course.outline, 0, [], 0, publication.outline_ids.split(',').map(id => parseInt(id)))
        console.log('FLAT', flat)
        const lookup = {}
        for (const flatElement of flat) {
            lookup[flatElement.id] = flatElement
        }

        setOutlineLookup(lookup)

    }, [])

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
        if (!contentRef.current) return
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

    const updateComments = () => {
        commentService.getComments(course).then(res => {
            if (res) setComments(res)
        })
    }

    const onScroll = (event) => {
        const els = event.target.getElementsByClassName('cocos-outline-title')
        const topElId = [...els].filter(el => el.getBoundingClientRect().y > 0)[0].id
        const id = parseInt(topElId.split('_')[1])
        setSelectedOutlineId(id)

    }

    const onOutlineItemSelect = (outlineItem) => {
        console.log('SEL OI', outlineItem)
        //window.location.hash = '#oi_' + outlineItem.id //Dit werkt ook!
        const el = document.getElementById('oi_' + outlineItem.id)
        el.scrollIntoView()
        setSelectedOutlineItem(outlineItem)
        //setSelectedOutlineId(0)
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


            {settings.showCourseOutline && <CourseViewerOutline outline={outline}
                                 onOutlineItemSelect={onOutlineItemSelect}/>}

            {previewData && <div ref={contentRef} className='editor-center-column'>
                <div>
                    {Parser(previewData)}</div>
            </div>}

            {settings.showCourseComments && <div className='editor-right-column'>
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
            </div>}
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