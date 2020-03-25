import React, {useState, useEffect} from 'react';


import {CourseService, CocosHeader, CocosUser, UserService, CommentService, Course, LtiConsumerCourseLink, CommentContext, CommentComp} from 'cocos-lib'
import './App.css'
import {Dropdown, Button} from "semantic-ui-react";
import CourseViewer from "./pages/CourseViewer";
import moment from "moment";
import _ from 'lodash'
import NoCourse from "./pages/NoCourse";
import Settings from "./pages/Settings";

const versionNum = require('./version')
const VIEW_IDLE = 'idle'
const VIEW_NO_COURSE = 'noCourse'
const VIEW_COURSE = 'course'
const VIEW_SETTINGS = 'settings'

function App(props) {

    const [currentView, setCurrentView] = useState(VIEW_IDLE)
    const [consumerVars, setConsumerVars] = useState()
    const [isAdmin, setIsAdmin] = useState(false)
    const [header, setHeader] = useState('CoCOS Viewer')
    const [courseService] = useState(new CourseService())
    const [commentService] = useState(new CommentService())
    const [userService] = useState(new UserService())
    const [ltiConsumerCourseLink, setLtiConsumerCourseLink] = useState()
    //const [courseOutline, setCourseOutline] = useState()
    const [course, setCourse] = useState()
    const [version, setVersion] = useState()
    const [publication, setPublication] = useState()
    const [cocosUser, setCocosUser] = useState()

    //console.log('VARS', window.user_id, window.custom_canvas_user_login_id, window.resource_link_id, window.roles, window)

    useEffect(() => {
        if (document.addEventListener) {
            document.addEventListener('click', interceptClickEvent);
        } else if (document.attachEvent) {
            document.attachEvent('onclick', interceptClickEvent);
        }
    }, [])

    useEffect(() => {
        //Initialisatie van parameters

        //de viewer kan ook parameters injecteren vanuit de url parameters (bv. voor niet LTI integratie)
        const urlParams = (new URL(document.location)).searchParams

        const vars = {
            userId: window.user_id || urlParams.get('userId') || '51e9ee7dc6318f005da822c325dbb6030d621747',
            userMail: window.custom_canvas_user_login_id || window.lis_person_contact_email_primary || urlParams.get('userMail') || 'danydh@arteveldehs.be',
            courseId: window.resource_link_id || urlParams.get('courseId') || 'c87749e8-ed6c-484d-8da2-33727af5e56a',
            roles: window.roles || 'Instructor',
            lis_person_name_given: window.lis_person_name_given,
            lis_person_name_family: window.lis_person_name_family,
            lis_person_name_full: window.lis_person_name_full,
            lis_person_contact_email_primary: window.lis_person_contact_email_primary,

            context_id: window.context_id,
            context_label: window.context_label,
            context_title:  window.context_title,
            //context voor canvas
            tool_consumer_info_product_family_code: window.tool_consumer_info_product_family_code,
            tool_consumer_info_version: window.tool_consumer_info_version,
            tool_consumer_instance_contact_email: window.tool_consumer_instance_contact_email,
            tool_consumer_instance_description: window.tool_consumer_instance_description ,
            tool_consumer_instance_guid: window.tool_consumer_instance_guid,
            tool_consumer_instance_name: window.tool_consumer_instance_name,
            tool_consumer_instance_url: window.tool_consumer_instance_url,

            consumer: window.tool_consumer_info_product_family_code || urlParams.get('consumer') || 'canvas'
        }
        const cu = new CocosUser()
        cu.email = vars.userMail
        setCocosUser(cu)
        console.log('C VARS', vars, window.roles)
        setConsumerVars(vars)
        setIsAdmin(vars.roles.indexOf('Instructor') > -1)
    }, [])

    useEffect(() => {

        if (!ltiConsumerCourseLink || ltiConsumerCourseLink.cocosCourseUuid === '' || ltiConsumerCourseLink.cocosVersionUuid === '') return

        Promise.all([
            courseService.getCourseByUuid(ltiConsumerCourseLink.cocosCourseUuid),
            courseService.getPublicationVersionByUuid(ltiConsumerCourseLink.cocosVersionUuid)]).then(([c, v]) => {

            const crs = c[0]
            const vrs = v[0]
            //TODO Checks: zowel course als version moeten bestaan / version.course moet gelijk zijn aan course.id!

            courseService.getPublicationById(vrs.publication).then(res => {
                setCourse(crs)
                setVersion(vrs)
                setPublication(res)
            })
        })
    }, [ltiConsumerCourseLink])

    useEffect(() => {

        if (!consumerVars) return
        //get ltiConsumerLink
        courseService.getLtiConsumerCourseLink(consumerVars.consumer, consumerVars.courseId).then(res => {
            //geen links gevonden
            if (!res && !isAdmin) {
                setCurrentView(VIEW_NO_COURSE)
            } else if (!res && isAdmin) {
                const ltiCCL = new LtiConsumerCourseLink()
                ltiCCL.consumer = consumerVars.consumer
                ltiCCL.consumerContextId = consumerVars.courseId
                ltiCCL.cocosCourseUuid = ''

                courseService.createLtiConsumerCourseLink(ltiCCL).then(link => {
                    setLtiConsumerCourseLink(link)
                    setCurrentView(VIEW_SETTINGS)
                })
            } else {
                setLtiConsumerCourseLink(res)
                setCurrentView(VIEW_COURSE)
            }
        })

    }, [consumerVars, isAdmin])

    const interceptClickEvent = (e) => {
        //let op, alle a's worden hierdoor vervangen!!
        return

        const target = e.target
        if (target.tagName === 'A') {
            target.setAttribute('target', '_blank')
        } else if (target.parentElement.tagName === 'A'){
            target.parentElement.setAttribute('target', '_blank')
        }
    }

    const onExitSettingsButtonClick = () => {
        console.log('EXIT', ltiConsumerCourseLink)
        setCurrentView(VIEW_COURSE)
    }

    const onBreakLinkClick = () => {
        courseService.deleteLtiConsumerCourseLink(ltiConsumerCourseLink).then(res => {
            setLtiConsumerCourseLink(null)
            setCourse(null)
            setVersion(null)
            setPublication(null)
            setCurrentView(VIEW_SETTINGS)
        })
    }

    console.log('CURRENT VIEW', currentView, course, publication, version, cocosUser)

    return (
        <div className="App">
            <CocosHeader>

                <div style={{flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{fontSize: '1.4em'}}>{header}</div>

                    {course && version && publication &&
                    <div>
                        <span style={{fontSize: '1.8em'}}>{course.title}</span>
                        <span style={{fontSize: '1em'}}> - Publication: {publication.title} - Version {version.version}</span>
                    </div>}

                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <div style={{color: '#666', marginRight: '10px'}}>Version {versionNum}</div>
                        {isAdmin && <Button icon='settings' size='tiny' onClick={() => setCurrentView(VIEW_SETTINGS)}/>}
                    </div>

                </div>


            </CocosHeader>

            {currentView === VIEW_NO_COURSE && <NoCourse/>}

            {currentView === VIEW_SETTINGS && ltiConsumerCourseLink &&
            <Settings ltiConsumerCourseLink={ltiConsumerCourseLink}
                      courseService={courseService}
                      onExitButtonClick={onExitSettingsButtonClick}
                      onBreakLinkClick={onBreakLinkClick}/>}


            {currentView === VIEW_COURSE && course && publication && version && cocosUser &&
            <CourseViewer courseService={courseService} commentService={commentService}
                          consumerVars={consumerVars}
                          course={course} cocosUser={cocosUser}
                          publication={publication} version={version}/>}
        </div>
    );
}

export default App;
