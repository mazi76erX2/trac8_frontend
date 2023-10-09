// ==============================|| OVERRIDES - BUTTON ||============================== //

export default function Button(theme) {
    const disabledStyle = {
        '&.Mui-disabled': {
            backgroundColor: theme.palette.grey[200]
        }
    };

    return {
        MuiButton: {
            defaultProps: {
                disableElevation: true
            },
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    fontSize: '15px',
                    fontFamily: 'Oswald'
                },
                contained: {
                    ...disabledStyle
                },
                outlined: {
                    ...disabledStyle
                }
            }
        }
    };
}
