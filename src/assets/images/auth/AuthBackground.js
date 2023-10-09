// material-ui
// import logo from 'assets/images/auth/authbg.jpg';

const AuthBackground = () => {
    return (
        <div
            style={{
                // backgroundImage: `url(${logo})`,
                backgroundClip: 'border-box',
                backgroundAttachment: 'scroll',
                backgroundColor: 'RGBA(255,255,255,0)',
                backgroundOrigin: 'padding-box',
                backgroundPositionX: '50%',
                backgroundPositionY: '50%',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                position: 'absolute',
                padding: '0px',
                margin: '0px',
                top: '0',
                left: '0',
                height: '100vh',
                width: '100vw',
                zIndex: '-1'
            }}
        ></div>
    );
};

export default AuthBackground;
