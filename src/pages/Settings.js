import React, {Fragment, useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {Form, Icon, Header, Select, Button, Divider, Segment} from "semantic-ui-react";

const Settings = ({ltiConsumerCourseLink, courseService, onExitButtonClick, onBreakLinkClick}) => {

    const [enableCourseValidation, setEnableCourseValidation] = useState(false)
    const [courseUUID, setCourseUUID] = useState(ltiConsumerCourseLink.cocosCourseUuid)
    const [course, setCourse] = useState()
    const [publicationsProvider, setPublicationsProvider] = useState()
    const [publication, setPublication] = useState()
    const [versionsProvider, setVersionsProvider] = useState()
    const [version, setVersion] = useState()
    console.log('LtiConsumerCourseLink', ltiConsumerCourseLink)

    useEffect(() => {
        attachCourse()
    }, [])

    useEffect(() => {
        if (!course) return
        courseService.getPublications(course).then(res => {
            setPublicationsProvider(res.map(p => {
                if (p.id === ltiConsumerCourseLink.cocosPublicationId) setPublication(p)
                return {key: p.id, text: `${p.title} (${p.type}) - Latest version: ${p.latest_version}`, value: p.id, publication: p}
            }))
        })
    }, [course])

    useEffect(() => {
        if (!publication) return
        courseService.getPublicationVersions(publication).then(vrs => {
            console.log('VERSIONS', vrs)
            setVersionsProvider(vrs.map(v => {
                if (v.uuid === ltiConsumerCourseLink.cocosVersionUuid) setVersion(v)
                return {key: v.id, text: `Version ${v.version} (${v.date})`, value: v.id, version: v}
            }))
        })
    }, [publication])

    const onChangeCourseUUID = (event, {value}) => {
        setCourseUUID(value)
        setEnableCourseValidation(value.length === 36)
    }

    const validateCourseUUID = () => {
        console.log('VALIDATING')
        attachCourse()
    }

    const attachCourse = () => {
        if (!courseUUID) return
        courseService.getCourseByUuid(courseUUID).then(res => {
            setEnableCourseValidation(false)
            if (res && res.length > 0) {
                setCourse(res[0])
                if (courseUUID !== ltiConsumerCourseLink.cocosCourseUuid){
                    ltiConsumerCourseLink.cocosPublicationId = 0
                    ltiConsumerCourseLink.cocosVersionUuid = ''
                }
                ltiConsumerCourseLink.cocosCourseUuid = courseUUID

                courseService.updateLtiConsumerCourseLink(ltiConsumerCourseLink)
            } else {
                setCourse(null)
            }
        })
    }

    const changePublication = (event, props) => {
        const p = publicationsProvider.reduce((cv, pub) => {
            console.log('RED', pub, props.value)
            if (pub.value === props.value) return pub
            return cv
        }, null)
        setPublication(p.publication)
        ltiConsumerCourseLink.cocosPublicationId = props.value
        ltiConsumerCourseLink.cocosVersionUuid = ''
        courseService.updateLtiConsumerCourseLink(ltiConsumerCourseLink)
    }

    const changeVersion = (event, {value}) => {
        console.log('CHANGE V', value)
        const v = versionsProvider.reduce((cv, vers) => {
            if (vers.value === value) return vers
            return cv
        }, null)
        setVersion(v.version)
        ltiConsumerCourseLink.cocosVersionUuid = v.version.uuid
        courseService.updateLtiConsumerCourseLink(ltiConsumerCourseLink)
    }

    const breakLink = () => {
        setCourse(null)
        onBreakLinkClick()
    }

    console.log('SETTINGS', course)

    return (
        <div className='flex-container'>
            <div style={{marginTop: '30px'}} className='content-container'>
                <div className='subheader'>Course settings</div>
                <Form>
                    {!course && <Fragment>
                        <p>Please enter a valid CoCos course uuid</p>
                        {/*<p>c87749e8-ed6c-484d-8da2-33727af5e56a</p>*/}
                        <Form.Input label='CoCos course UUID' value={courseUUID}
                                    icon={course ? <Icon name='check circle' color='green'/> : null}
                                    onChange={onChangeCourseUUID}/>
                        {enableCourseValidation && <Form.Button content='Validate' onClick={validateCourseUUID}/>}
                    </Fragment>}

                    {course && <Fragment>

                        <Header>CoCos course details</Header>

                        <p>Title: {course.title}</p>


                        {publicationsProvider && <Fragment>
                            <Header>Publications</Header>

                            {publicationsProvider.length === 0 && <p>This course has no publications. Please inform the owner of this course to create one.</p>}

                            {publicationsProvider && publicationsProvider.length > 0 && <Fragment>
                                <Form.Field>
                                    <label>Choose a publication</label>
                                    <Select options={publicationsProvider} value={publication ? publication.id : null} onChange={changePublication}/>
                                </Form.Field>
                            </Fragment>}
                        </Fragment>}

                        {versionsProvider && <Fragment>
                            <Header>Versions</Header>

                            {versionsProvider.length === 0 && <p>This publication has no versions. Please inform the owner of this course to create one.</p>}

                            {versionsProvider && versionsProvider.length > 0 && <Fragment>
                                <Form.Field>
                                    <label>Choose a version</label>
                                    <Select options={versionsProvider} value={version ? version.id : null} onChange={changeVersion}/>
                                </Form.Field>
                            </Fragment>}
                        </Fragment>}

                    </Fragment>}

                    <Divider/>

                    <Segment>
                        <Button color='teal' onClick={onExitButtonClick}>Exit and view course</Button>
                        <Button color='red' onClick={breakLink}>Break LTI link and change course</Button>
                    </Segment>

                    <i>Beta: Please refresh the page after clicking one of these buttons</i>
                </Form>
            </div>
        </div>
    )
}

export default Settings

Settings.propTypes = {
    ltiConsumerCourseLink: PropTypes.object.isRequired,
    courseService: PropTypes.object.isRequired,
    onExitButtonClick: PropTypes.func,
    onBreakLinkClick: PropTypes.func,
}

Settings.defaultProps = {}