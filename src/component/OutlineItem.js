import React, {useState} from 'react'
import PropTypes from 'prop-types'
const INDENT = 20

const OutlineItem = ({element, indent, onItemClick}) => {

    if (!element.status) element.status = 'closed'

    return (
        <div>
            <div style={{display: 'flex',
                cursor: 'pointer',
                backgroundColor: element.selected ? 'rgba(50,50,50,0.2)' : '',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1px',
                padding: '10px',
                paddingLeft: indent + 5,
                borderLeft: element.selected ? '3px solid teal' : '',
                fontWeight: element.selected ? 'bold': '',
                maxWidth: '200px'}}
                 onClick={() => onItemClick(element)}>

                {element.title}
                {/*{element.children && <div>+</div>}*/}
            </div>
            {element.children && element.status === 'open' &&
            element.children.map((child, index) => {
                return <OutlineItem key={index} element={child} indent={indent + INDENT} onItemClick={onItemClick}/>
            })
            }
        </div>

    )
}

export default  OutlineItem

OutlineItem.propTypes = {
    element: PropTypes.object,
    indent: PropTypes.number,
    indentUnit: PropTypes.number,
    onItemClick: PropTypes.func
}

OutlineItem.defaultProps = {
    indent: 0
}