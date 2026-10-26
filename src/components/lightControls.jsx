import { useState, useRef, useEffect } from "react";

import {
    Card,
    Box,
    Typography,
    Button,
    Switch,
    Slider,
    ToggleButton,
    ToggleButtonGroup
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";

import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { Wheel } from '@uiw/react-color';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

function LightControls({
    bulb,
    bulbState,
    onToggle,
    onBrightnessChange,
    onBrightnessPreview,
    onEdit,
    onTempPreview,
    onTempChange,
    onColorChange,
    dragHandleProps,
    handleSaved


}) {
    const isOn = bulbState?.isOn ?? false;
    const brightness = bulbState?.brightness ?? 50;
    const isRGB = bulb.is_rgb;
    const temp = bulbState?.temp ?? 3500;
    const maxTemp = bulb.max_temp
    const minTemp = bulb.min_temp
    const r = bulbState?.r ?? 0
    const g = bulbState?.g ?? 0
    const b = bulbState?.b ?? 0
    const colorTimer = useRef(null);

    const isUnReachable = bulb.max_temp == null;

    const { r: kr, g: kg, b: kb } = kelvinToRgb(temp);



    const rgbToHex = (r, g, b) => {
        const toHex = (channel) => {

            const clamped = Math.max(0, Math.min(255, channel));
            return clamped.toString(16).padStart(2, '0');
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };




    const cctHex = rgbToHex(kr, kg, kb);

    const [selectedMode, setSelectedMode] = useState(
        bulb.red != null ? "rgb" : "cct"
    );

    const [hex, setHex] = useState(r + b + g === 0 ? rgbToHex(kr, kg, kb) : rgbToHex(r, g, b));




    function kelvinToRgb(kelvin) {
        const temp = kelvin / 100;
        let r, g, b;

        // Red
        if (temp <= 66) {
            r = 255;
        } else {
            r = temp - 60;
            r = 329.698727446 * Math.pow(r, -0.1332047592);
            r = Math.max(0, Math.min(255, r));
        }

        // Green
        if (temp <= 66) {
            g = temp;
            g = 99.4708025861 * Math.log(g) - 161.1195681661;
        } else {
            g = temp - 60;
            g = 288.1221695283 * Math.pow(g, -0.0755148492);
        }
        g = Math.max(0, Math.min(255, g));

        // Blue
        if (temp >= 66) {
            b = 255;
        } else if (temp <= 19) {
            b = 0;
        } else {
            b = temp - 10;
            b = 138.5177312231 * Math.log(b) - 305.0447927307;
            b = Math.max(0, Math.min(255, b));
        }

        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    }


    const hexToRgb = (hex) => {
        const clean = hex.replace('#', '');
        return {
            r: parseInt(clean.substring(0, 2), 16),
            g: parseInt(clean.substring(2, 4), 16),
            b: parseInt(clean.substring(4, 6), 16),
        };
    };


    const cctSlider = (
        <>



            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>

                <Typography sx={{ mt: 1, fontFamily: "monospace" }}>Warmth</Typography>

                <Typography sx={{ mt: 1, fontFamily: "monospace" }}>{temp} K</Typography>

            </Box>

            {isOn ? (<Slider
                min={minTemp}
                max={maxTemp}
                value={temp}
                onChange={(e, value) => {
                    onTempPreview(bulb, value)
                    const { r, g, b } = kelvinToRgb(value);

                    setHex(rgbToHex(r, g, b));
                    console.log(hex);


                }}
                onChangeCommitted={(e, value) =>

                    onTempChange(bulb, value)
                }
                sx={{
                    height: 9,
                    '& .MuiSlider-track': { border: 'none', background: 'transparent' },
                    '& .MuiSlider-rail': {
                        opacity: 1,
                        background: 'linear-gradient(to right, #ff9c3c, #f7faa6ff , #cbe1ffff) ',
                    },
                }}
            />) :




                (<Slider
                    min={minTemp}
                    max={maxTemp}
                    value={temp}
                    disabled
                    sx={{ height: 8 }}
                />)}




        </>
    );


    useEffect(() => {
        return () => {
            if (colorTimer.current) {
                clearTimeout(colorTimer.current);
            }
        };
    }, []);

    return (

        <Box className={isOn ? (selectedMode === 'rgb' ? ("glow-border") : ("glow-border1")) : ("")}  >

            <Card
                sx={{
                    p: 2,

                    width: 300,
                    borderRadius: 5,
                    height: "100%",
                    backgroundColor: "background.paper",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <DragIndicatorIcon
                        {...dragHandleProps}
                        sx={{ cursor: 'grab', color: 'text.secondary' }}
                    />
                    <Typography sx={{ fontFamily: "monospace" }}>{bulb.name}</Typography>

                    <Button onClick={onEdit}>
                        <EditIcon />
                    </Button>


                </Box>




                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 2,
                    }}
                >
                    <LightbulbOutlinedIcon
                        onClick={() => { if (!isUnReachable) { onToggle(bulb) } }}

                        sx={{
                            fontSize: 150,
                            cursor: "pointer",
                            color: !isOn
                                ? "gray"
                                : isRGB
                                    ? (selectedMode === 'cct' ? cctHex : hex)
                                    : cctHex,

                            transition: "all 0.4s ease",
                            filter: isOn
                                ? (selectedMode === 'cct' ? `drop-shadow(0 0 25px ${cctHex})` : `drop-shadow(0 0 25px ${hex})`)
                                : "none",
                        }}
                    />


                    {isUnReachable ? (
                        <Card
                            sx={{
                                mt: 2,
                                p: 2,
                                width: "100%",
                                borderRadius: 3,
                                bgcolor: "warning.dark",
                                color: "warning.contrastText",
                                border: "1px solid",
                                borderColor: "warning.main",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <WarningAmberIcon sx={{ fontSize: 42 }} />

                            <Typography
                                fontFamily="monospace"
                                fontWeight="bold"
                            >
                                Bulb Offline
                            </Typography>

                            <Typography
                                variant="body2"
                                textAlign="center"
                                sx={{ opacity: 0.85 }}
                            >
                                This bulb could not be reached.
                                It may be powered off or disconnected from Wi-Fi.
                            </Typography>

                            <Button
                                onClick={() => handleSaved()}
                                size="small"
                                variant="contained"
                                color="warning"
                            >
                                Retry
                            </Button>
                        </Card>

                    )



                        : (


                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >









                                    <Typography sx={{ fontFamily: "monospace" }} >Power</Typography>



                                    <Switch
                                        checked={isOn}
                                        onChange={() => onToggle(bulb)}
                                    />
                                </Box>




                                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>

                                    <Typography sx={{ mt: 1, fontFamily: "monospace" }}>Brightness</Typography>

                                    <Typography sx={{ mt: 1, fontFamily: "monospace" }}>{brightness}%</Typography>

                                </Box>

                                {isOn ? (
                                    <Slider
                                        sx={{ height: 8, }}
                                        min={10}
                                        max={100}
                                        value={brightness}
                                        onChange={(e, value) =>
                                            onBrightnessPreview(bulb, value)
                                        }
                                        onChangeCommitted={(e, value) =>
                                            onBrightnessChange(bulb, value)
                                        }
                                    />
                                ) : (
                                    <Slider
                                        sx={{ height: 8, }}
                                        disabled
                                        min={10}
                                        max={100}
                                        value={brightness}
                                    />
                                )}

                                {isRGB ? (

                                    <>

                                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>

                                            <ToggleButtonGroup

                                                value={selectedMode}
                                                exclusive
                                                color="primary"
                                                onChange={(e, value) => {
                                                    if (value !== null) {
                                                        setSelectedMode(value);
                                                        if (value === 'cct' && isOn) {
                                                            onTempChange(bulb, temp);
                                                        } else if (value === 'rgb' && isOn) {
                                                            const { r, g, b } = hexToRgb(hex);
                                                            onColorChange(bulb, { r, g, b });
                                                        }
                                                    }
                                                }}
                                            >
                                                <ToggleButton sx={{ fontFamily: "monospace" }} value="cct">
                                                    CCT
                                                </ToggleButton>

                                                <ToggleButton sx={{ fontFamily: "monospace" }} value="rgb">
                                                    RGB
                                                </ToggleButton>
                                            </ToggleButtonGroup>
                                        </Box>


                                        {selectedMode === 'cct' ? (

                                            cctSlider


                                        ) : (

                                            <Box sx={{ mt: 3, display: "flex", justifyContent: 'center', pointerEvents: isOn ? 'auto' : 'none', opacity: isOn ? 1 : 0.3 }}>

                                                <Wheel
                                                    width={170}
                                                    height={170}

                                                    color={hex}
                                                    onChange={(color) => {
                                                        console.log(color);
                                                        setHex(color.hex);

                                                        if (colorTimer.current) {
                                                            clearTimeout(colorTimer.current);
                                                        }

                                                        colorTimer.current = setTimeout(() => { onColorChange(bulb, color.rgb); }, 200);



                                                    }}
                                                />

                                            </Box>)}


                                    </>



                                ) : (cctSlider)



                                }



                            </Box>

                        )}
                </Box>




            </Card >

        </Box>

    );
}

export default LightControls;