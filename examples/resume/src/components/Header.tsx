import React from 'react';

interface ContactInfo {
  email: string;
  phone?: string;
  location: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

interface HeaderProps {
  name: string;
  title: string;
  contact: ContactInfo;
  summary: string;
}

const Header: React.FC<HeaderProps> = ({ name, title, contact, summary }) => {
  return (
    <header className="mb-8">
      <h1 className="text-4xl font-bold mb-2">{name}</h1>
      <h2 className="text-2xl text-gray-600 mb-4">{title}</h2>
      
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{contact.location}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">{contact.email}</a>
        </div>
        
        {contact.phone && (
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 16.92V19.92C22 20.4704 21.7893 20.9996 21.4142 21.3747C21.0391 21.7498 20.5099 21.9605 19.96 21.96C17.4223 21.7383 14.9575 20.9544 12.78 19.67C10.7666 18.5001 9.01224 16.7458 7.84003 14.73C6.55096 12.5408 5.76566 10.0607 5.54003 7.50996C5.53904 6.96237 5.74652 6.43479 6.11874 6.05996C6.49097 5.68514 7.01643 5.47182 7.56003 5.46996H10.56C11.0147 5.4673 11.4546 5.63904 11.7895 5.95358C12.1245 6.26812 12.3333 6.70068 12.38 7.15996C12.4747 8.11212 12.6663 9.04952 12.95 9.95996C13.0869 10.3524 13.087 10.7788 12.9502 11.1716C12.8135 11.5644 12.5493 11.9021 12.2 12.14L10.9 13.44C11.9737 15.5487 13.688 17.2631 15.8 18.34L17.1 17.04C17.3379 16.6908 17.6757 16.4267 18.0687 16.2899C18.4616 16.1532 18.8883 16.1533 19.28 16.29C20.1905 16.5737 21.1279 16.7653 22.08 16.86C22.5428 16.9068 22.9777 17.1178 23.2936 17.457C23.6096 17.7961 23.7809 18.2406 23.78 18.7V16.92H22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">{contact.phone}</a>
          </div>
        )}
        
        {contact.github && (
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 19C4.7 20.4 4.7 16.5 3 16M15 21V17.5C15 16.5 15.1 16.1 14.5 15.5C17.3 15.2 20 14.1 20 9.49995C19.9988 8.30492 19.5325 7.15726 18.7 6.29995C19.0905 5.26108 19.0545 4.11108 18.6 3.09995C18.6 3.09995 17.5 2.79995 15.6 4.09995C14.0223 3.65541 12.3777 3.65541 10.8 4.09995C8.9 2.79995 7.8 3.09995 7.8 3.09995C7.3455 4.11108 7.3095 5.26108 7.7 6.29995C6.86744 7.15726 6.40117 8.30492 6.4 9.49995C6.4 14.1 9.1 15.2 11.9 15.5C11.3 16.1 11.2 16.5 11.2 17.5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <a href={`https://${contact.github}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{contact.github}</a>
          </div>
        )}
        
        {contact.linkedin && (
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <a href={`https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{contact.linkedin}</a>
          </div>
        )}
        
        {contact.website && (
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <a href={`https://${contact.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{contact.website}</a>
          </div>
        )}
      </div>
      
      <p className="text-gray-700">{summary}</p>
    </header>
  );
};

export default Header; 