import React from 'react'
import { Link } from 'react-router-dom'

const BannerBox = (props) => {
  return (
    <div className="box bannerBox overflow-hidden rounded-lg group">
      {props.link ? (
        <Link to={props.link} className="block">
          <img src={props.img} alt="banner" className="w-full transition-all group-hover:scale-105 group-hover:rotate-1" />
        </Link>
      ) : (
        <img src={props.img} alt="banner" className="w-full transition-all group-hover:scale-105 group-hover:rotate-1" />
      )}
    </div>
  )
}

export default BannerBox
