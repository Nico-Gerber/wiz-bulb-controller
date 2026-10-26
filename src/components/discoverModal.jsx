import React from 'react'
// Mui
import {
    Button, Typography, Box, Card, Modal
} from '@mui/material';

import { BlinkBlur } from "react-loading-indicators";
import LightIcon from '@mui/icons-material/EmojiObjects';
import DoneIcon from '@mui/icons-material/Done';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const MONO = { fontFamily: "monospace" };

export default function DiscoverModal({ scannerOpen, handleScannerClose, loading, discoveredBulbs, attempedScan, setattempedScan, handleScan, handleAddBulb, handleSaved, savedBulbs }) {
    return (
        <Modal
            open={scannerOpen}
            onClose={handleScannerClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"

        >

            <Box sx={{
                display: "flex", flexDirection: 'column', gap: 2,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 500,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 24,
                borderRadius: 2,
                p: 4,
            }}>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ fontFamily: MONO }}>
                    Scan for lights
                </Typography>





                {loading === true && (<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, flexDirection: 'column', gap: 3 }} >

                    <BlinkBlur color="#32cd32" size="medium" text="" textColor="" />

                    <Typography sx={{ color: 'gray', fontFamily: MONO }} >Searching for bulbs...</Typography>


                </Box>)}


                {discoveredBulbs && loading === false && (


                    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexDirection: 'column' }}>

                        {discoveredBulbs.map((bulb) => {

                            const isAdded = savedBulbs.some(saved => saved.mac === bulb.mac);


                            return (



                                <Card key={bulb.mac} variant="outlined" sx={{
                                    display: 'flex', flexDirection: 'row', padding: 2, alignItems: 'center',

                                    borderWidth: '2px',
                                }}>
                                    <LightIcon sx={{ fontSize: 70 }} />


                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <Typography sx={{ fontWeight: 500 }}>{bulb.name}</Typography>
                                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{bulb.ip}</Typography>
                                    </Box>


                                    {isAdded ? <Button color="success" > <DoneIcon /> </Button> : <Button onClick={() => { handleAddBulb(bulb); handleSaved(); }} variant='outlined'>Add</Button>}


                                </Card>
                            )
                        })}

                    </Box>)}

                {discoveredBulbs.length === 0 && loading === false && attempedScan === true && (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        <SearchOffIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography>No new bulbs found</Typography>
                        <Typography sx={{ fontSize: 13 }}>
                            No new bulbs to add. If you're expecting one, make sure it's set up in the WiZ app and on this network.
                        </Typography>
                    </Box>
                )}


                <Button variant="contained" onClick={() => { handleScan(); setattempedScan(true) }}> Scan</Button>

            </Box>
        </Modal>
    )
}
