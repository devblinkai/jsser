import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";

export const UpdateApiKey = ({onClick}) => {


  return (
    <div style={styles.container}>
      <button onClick={onClick} style={styles.button}>
        <div style={styles.iconContainer}>
          <FontAwesomeIcon icon={faKey} style={styles.icon} />
        </div>
      </button>
    </div>
  );
};

const styles = {
  container: {
    // You can add any container styles here if needed
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  iconContainer: {
    // backgroundColor: 'rgba(226, 227, 227, 0.2)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: 'white',
    fontSize: '18px',
  },
};

export default UpdateApiKey;