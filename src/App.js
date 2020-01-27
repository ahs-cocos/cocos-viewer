import React, {useState, useEffect} from 'react';


import {CourseService, CocosHeader, CocosUser, UserService, Course} from 'cocos-lib'
import './App.css'
import {Dropdown} from "semantic-ui-react";
import CourseViewer from "./pages/CourseViewer";
import moment from "moment";
import _ from 'lodash'

const versionNum = require('./version')

function App({uuids}) {

    const [courseService] = useState(new CourseService())
    const [userService] = useState(new UserService())
    //const [courseOutline, setCourseOutline] = useState()
    const [course, setCourse] = useState()
    const [version, setVersion] = useState()
    const [publication, setPublication] = useState()

    console.log('PROPS', uuids.course, uuids.version)
    /*useEffect(() => {
        const treeData = [
            { title: 'Chicken', children: [{ title: 'Egg' }] },
            { title: 'Fish', children: [{ title: 'fingerline'}] }
            ]

        setCourseOutline(treeData)
    }, [])*/

    useEffect(() => {
        Promise.all([courseService.getCourseByUuid(uuids.course), courseService.getPublicationVersionByUuid(uuids.version)]).then(([c, v]) => {

            const crs = c[0]
            const vrs = v[0]
            //TODO Checks: zowel course als version moeten bestaan / version.course moet gelijk zijn aan course.id!
            console.log('COURSE', c[0], v[0])

            courseService.getPublicationById(vrs.publication).then(res => {
                console.log('PUB', res)
                setCourse(crs)
                setVersion(vrs)
                setPublication(res)
            })
        })
    }, [])


    //console.log('OUTLINE', courseOutline)

    if (!course || !version || !publication) return null
    return (
        <div className="App">
            <CocosHeader>

                <div style={{flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'baseline'}}>
                    <div style={{fontSize: '1.8em'}}>{course.title}</div>
                    <div style={{fontSize: '1em', marginLeft: '10px'}}>Publication: {publication.title} - Version {version.version}</div>
                </div>

                <div style={{marginRight: '20px', color: '#666'}}>Version {versionNum}</div>

                {/*{user &&
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <img height='40px' src={user.photoURL} style={{marginRight: '20px'}} alt='User avatar'/>
                    <div>{user.displayName} - <Button size='mini' onClick={signOut}>Logout</Button></div>

                    <Dropdown text={`${user.displayName} (${user.email})`} pointing className='link item'>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={onSignOut}>Sign out</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>


                </div>
                }*/}
            </CocosHeader>


            <CourseViewer course={course}/>
            {/*{(currentView === 'course' && selectedCourse) && <CourseEditor courseService={courseService}
                                                                           course={selectedCourse}
                                                                           cocosUser={cocosUser}
                                                                           onBackToOverviewButtonClick={() => setCurrentView('courses')}
                                                                           updateCourse={updateCourse}
                                                                           deleteCourse={deleteCourse}/>}*/}
        </div>
    );
}

export default App;
