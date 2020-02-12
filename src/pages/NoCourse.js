import React from 'react'
import PropTypes from 'prop-types'
import {Message} from "semantic-ui-react";

const NoCourse = (props) => {

    return (
        <Message>
            <Message.Header>No cocos course available</Message.Header>
            <p>
                Contact your course administrator if you think there is a problem
            </p>
        </Message>
    )
}

export default  NoCourse

NoCourse.propTypes = {

}

NoCourse.defaultProps = {

}