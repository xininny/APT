import React from 'react';
import Swal from 'sweetalert2';
import InfoIcon from './svg/info.svg';
import './Info.css'; // CSS 파일 임포트

const InfoPopup = () => {
    const handleInfoClick = () => {
        Swal.fire({
            title: 'Map Information',
            width: '538px',
            html: `
    <div style="text-align: left;">
        <p>1. Navigate to the Map, Victims, Attackers, or Timeline page from the top menu.</p>
        <p>2. Select the desired year to view data specific to that year.</p>
        <p>3. Click on a country on the map to filter attacks or victim cases by nation.</p>
        <p>4. Select a Threat Actor to view detailed information on related attacks.</p>
    </div>
`,

            confirmButtonText: 'Close',
            confirmButtonColor: '#3085d6',
            background: '#fff',
            backdrop: `rgba(0, 0, 0, 0.4)`,
            showCancelButton: false,
            customClass: {
                htmlContainer: 'swal2-html-container',
                title: 'swal2-title', // title 클래스 적용
            },
        });
    };

    return (
        <img
            src={InfoIcon}
            alt="Info icon"
            className="Info-icon"
            style={{ marginTop: '14px', marginLeft: '1840px', cursor: 'pointer' }}
            onClick={handleInfoClick}
        />
    );
};

export default InfoPopup;
