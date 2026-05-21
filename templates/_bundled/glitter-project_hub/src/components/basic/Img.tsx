import React from 'react';

export interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {}


export const Img: React.FC<ImgProps> = ({
  className = '',
  alt = '',
  ...props
}) => {
  return (
    <img
      className={className}
      alt={alt}
      {...props}
    />
  );
};
