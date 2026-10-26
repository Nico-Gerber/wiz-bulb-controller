// React
import { useState, useEffect } from 'react'

// Mui
import {
  Button, Typography, Box, Container,
  Divider, Paper, IconButton, Chip
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// Drag and drop
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { BlinkBlur } from "react-loading-indicators";
import { AnimatePresence } from "framer-motion";

import PopUp from "../components/popUp";
import DiscoverModal from '../components/discoverModal';
import EditModal from '../components/EditModal';
import SortableBulb from '../components/SortableBulb';
import GroupSelector from '../components/GroupSelector';
import AddGroupModal from '../components/AddGroupModal';
import EditGroupModal from '../components/EditGroupModal';

import { apiFetch } from "../api/config";

const MONO = { fontFamily: "monospace" };




function Bulbs() {

  const SCENES = [

    { id: '1', name: 'Ocean', colors: '#0575e6, #00f260', RGB_only: true, Dynamic: true },
    { id: '2', name: 'Romance', colors: '#c94b4b, #4b134f', RGB_only: true, Dynamic: true },
    { id: '3', name: 'Sunset', colors: '#ff512f, #f09819', RGB_only: true, Dynamic: true },
    { id: '4', name: 'Party', colors: '#f857a6, #4b6cb7, #43e97b', RGB_only: true, Dynamic: true },
    { id: '5', name: 'Fireplace', colors: '#c02425, #f0cb35', RGB_only: true, Dynamic: true },
    { id: '6', name: 'Cozy', colors: '#dd9c5e, #b06a3b', RGB_only: false, Dynamic: false },
    { id: '7', name: 'Forest', colors: '#5a3f37, #2c7744', RGB_only: true, Dynamic: true },
    { id: '8', name: 'Pastel colors', colors: '#ffafbd, #a1c4fd, #c2e9fb', RGB_only: true, Dynamic: true },
    { id: '9', name: 'Wake-up', colors: '#f2994a, #f2c94c', RGB_only: false, Dynamic: true },
    { id: '10', name: 'Bedtime', colors: '#011b57, #013975', RGB_only: false, Dynamic: true },
    { id: '11', name: 'Warm white', colors: '#fde7c9, #f5cd79', RGB_only: false, Dynamic: false },
    { id: '12', name: 'Daylight', colors: '#e6dada, #f0f4ff', RGB_only: false, Dynamic: false },
    { id: '13', name: 'Cool white', colors: '#e0eafc, #cfdef3', RGB_only: false, Dynamic: false },
    { id: '14', name: 'Night light', colors: '#3a1c71, #5a3f8f', RGB_only: false, Dynamic: false },
    { id: '15', name: 'Focus', colors: '#c9d6ff, #e2e2e2', RGB_only: false, Dynamic: false },
    { id: '16', name: 'Relax', colors: '#f7b733, #fc4a1a', RGB_only: false, Dynamic: false },
    { id: '17', name: 'True colors', colors: '#fc466b, #3f5efb, #11998e', RGB_only: true, Dynamic: false },
    { id: '18', name: 'TV time', colors: '#2b5876, #4e4376', RGB_only: false, Dynamic: true },
    { id: '19', name: 'Plantgrowth', colors: '#11998e, #56ab2f', RGB_only: true, Dynamic: true },
    { id: '20', name: 'Spring', colors: '#a8e063, #f9d976', RGB_only: true, Dynamic: true },
    { id: '21', name: 'Summer', colors: '#f7971e, #ffd200', RGB_only: true, Dynamic: true },
    { id: '22', name: 'Fall', colors: '#d38312, #a83279', RGB_only: true, Dynamic: true },
    { id: '23', name: 'Deep dive', colors: '#003973, #0083b0', RGB_only: true, Dynamic: true },
    { id: '24', name: 'Jungle', colors: '#134e5e, #71b280', RGB_only: true, Dynamic: true },
    { id: '25', name: 'Mojito', colors: '#1d976c, #93f9b9', RGB_only: true, Dynamic: true },
    { id: '27', name: 'Christmas', colors: '#b91d1d, #1aa145ff', RGB_only: true, Dynamic: true },
    { id: '28', name: 'Halloween', colors: '#ff7518, #2d0b46', RGB_only: true, Dynamic: true },
    { id: '29', name: 'Candlelight', colors: '#e6a12c, #a85507', RGB_only: false, Dynamic: true },
    { id: '30', name: 'Golden white', colors: '#f5d76e, #e6b800', RGB_only: false, Dynamic: false },
    { id: '31', name: 'Pulse', colors: '#eeca80, #b06ab3', RGB_only: false, Dynamic: true },
    { id: '32', name: 'Steampunk', colors: '#b79891, #94716b', RGB_only: false, Dynamic: true },
    { id: '33', name: 'Diwali', colors: '#f7971e, #d38312, #c31432', RGB_only: false, Dynamic: true },
    { id: '34', name: 'White', colors: '#ffffff, #e0e0e0', RGB_only: false, Dynamic: false },
    { id: '35', name: 'Alarm', colors: '#cb2d3e, #ef473a', RGB_only: false, Dynamic: true },






  ]

  //Bulb Arrays
  const [discoveredBulbs, setDiscoveredBulbs] = useState([]);

  console.log("Discovered", discoveredBulbs)

  const [savedBulbs, setSavedBulbs] = useState([]);

  const [bulbStates, setBulbStates] = useState({});

  // Loading Condition
  const [loading, setLoading] = useState(false)

  const [loadingForSavedBulbs, setLoadingForSavedBulbs] = useState(false)


  //Scanner Modal
  const [scannerOpen, setScannerOpen] = useState(false);
  const handleScannerOpen = () => setScannerOpen(true);
  const handleScannerClose = () => { setScannerOpen(false); setattempedScan(false); setDiscoveredBulbs([]); }



  //Edit Modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); setMacroError(''); setIsKeyListening(false) }


  //Add Group Modal
  const [openGroupModal, setGroupModal] = useState(false);
  const handleOpenGroupModal = () => setGroupModal(true);
  const handleCloseGroupModal = () => setGroupModal(false);



  //Updating Name

  const [editingBulb, setEditingBulb] = useState(null);

  console.log(editingBulb)



  const [name, setName] = useState('');

  //pop up stuff

  const [showToast, setShowToast] = useState(false);

  const [popUpText, setPopUpText] = useState("");



  const [attempedScan, setattempedScan] = useState(false)



  const [selectedGroup, setSelectedGroup] = useState({ name: "ALL", id: "0" })

  console.log(selectedGroup.id)

  const [groupName, setGroupname] = useState('')

  const [editingGroupName, setEditingGroupName] = useState("");


  const [groups, setGroups] = useState([]);

  const [selectedGroupLight, setSelectedGroupLight] = useState('')

  console.log(selectedGroupLight)


  const [macroTarget, setMacroTarget] = useState(null);


  //Eit Group Modal
  const [openEditGroupModal, setOpenEditGroupModal] = useState(false);
  const handleOpenEditGroupModal = () => {
    setOpenEditGroupModal(true); setMacroTarget({
      type: selectedGroup.id === "0" ? "all" : "group",
      id: selectedGroup.id === "0" ? "all" : selectedGroup.id,
    });
  }
  const handleCloseEditGroupModal = () => { setOpenEditGroupModal(false); setIsKeyListening(null); setMacroError('') }



  const [isKeyListening, setIsKeyListening] = useState(null)


  const [onKey, setOnKey] = useState(null);
  const [offKey, setOffKey] = useState(null);

  const [onMacroId, setOnMacroId] = useState(null)
  const [offMacroId, setOffMacroId] = useState(null)


  const [savedMacros, setSavedMacros] = useState([])

  const [macroError, setMacroError] = useState('')


  const [currentScene, setScene] = useState(null)

  console.log(currentScene)



  function KeyboardListener() {
    useEffect(() => {

      const handleKeyDown = (event) => {
        console.log('Key pressed:', event.key);
        console.log('Key code:', event.code);

        const macrosInUse = (key) => {
          return savedMacros.some(macro => macro.key == key)
        }

        if (macrosInUse(event.key)) {
          setMacroError("Key is already in use")
          return;
        }

        if (isKeyListening === "on") {
          if (event.key === offKey) {
            setMacroError("Key is already in use")
            return;
          };

          setOnKey(event.key);
        }

        if (isKeyListening === "off") {
          if (event.key === onKey) {
            setMacroError("Key is already in use")
            return;
          }

          setOffKey(event.key);
        }

        setIsKeyListening(null);


      };


      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, []);

  }




  //Scanning for new lights

  const handleScan = async () => {
    setLoading(true)
    try {
      const response = await apiFetch("/find", {
        method: "POST"
      });
      const data = await response.json();

      setDiscoveredBulbs(data);

      console.log("Server Response:", discoveredBulbs);

      setLoading(false)

    } catch (error) {
      console.error("Error posting data:", error)
    }

  }


  //Loading Saved lights

  const handleSaved = async () => {
    setLoadingForSavedBulbs(true)

    try {
      const response = await apiFetch("/find/saved", {
        method: "GET"
      });
      const data = await response.json();
      setSavedBulbs(data.bulbs);

      const states = {};
      data.bulbs.forEach(bulb => {
        states[bulb.mac] = {
          isOn: bulb.is_on,
          brightness: bulb.brightness,
          temp: bulb.color_temp,
          r: bulb.red,
          g: bulb.green,
          b: bulb.blue


        };
      });
      setBulbStates(states);
      setLoadingForSavedBulbs(false)
      console.log("Saved:", data.bulbs);
    } catch (error) {
      console.error("Error getting data:", error);
    }
  };


  const handleUpdateBulbState = async () => {


    try {
      const response = await apiFetch("/find/saved", {
        method: "GET"
      });
      const data = await response.json();
      setSavedBulbs(data.bulbs);

      const states = {};
      data.bulbs.forEach(bulb => {
        states[bulb.mac] = {
          isOn: bulb.is_on,
          brightness: bulb.brightness,
          temp: bulb.color_temp,
          r: bulb.red,
          g: bulb.green,
          b: bulb.blue


        };
      });
      setBulbStates(states);

      console.log("Saved:", data.bulbs);
    } catch (error) {
      console.error("Error getting data:", error);
    }
  };


  const handleGetGroups = async () => {
    try {
      const response = await apiFetch("/group/get", {
        method: "GET"
      });
      const data = await response.json();

      setGroups(data.groups)



      console.log("Saved:", data.groups);
    } catch (error) {
      console.error("Error getting groups:", error);
    }
  }



  //Adding saved bulb from list

  const handleAddBulb = async (bulb) => {
    try {
      const response = await apiFetch("/find/add"

        , {
          method: "POST",
          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({
            mac: bulb.mac,
            ip: bulb.ip,
            name: bulb.name,
            is_rgb: bulb.is_rgb

          }),

        });
      const data = await response.json();
      console.log("Server Response:", data);
    } catch (error) {
      console.error("Error posting data:", error);
    }
  }

  // On and Off logic
  const handleOnandOff = async (target, bulbIp) => {
    try {
      const response = await apiFetch(`/bulb/${target}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ ip: bulbIp }),
      });
      const data = await response.json();
      console.log("Server Response:", data);
    } catch (error) {
      console.error("Error posting data:", error);
    }
  }


  const togglePower = (bulb) => {
    const newState = !bulbStates[bulb.mac]?.isOn;
    setBulbStates(prev => ({
      ...prev,
      [bulb.mac]: { ...prev[bulb.mac], isOn: newState }
    }));
    handleOnandOff(newState ? "On" : "Off", bulb.ip);
  };



  //Changing Brighness
  const handleBrightnessChange = async (bulb, newValue) => {

    try {
      const response = await apiFetch("/bulb/Brightness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ ip: bulb.ip, value: newValue }),
      });
      const data = await response.json();
      console.log("Server Response:", data);
    } catch (error) {
      console.error("Error posting data:", error);
    }



  }


  const handleTempChange = async (bulb, newValue) => {

    try {
      const response = await apiFetch("/bulb/Temp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ ip: bulb.ip, temp: newValue }),
      });
      const data = await response.json();
      console.log("Server Response:", data);
    } catch (error) {
      console.error("Error posting data:", error);
    }



  }





  //Update Name
  const handleUpdateName = async (bulb, new_name) => {
    try {
      const response = await apiFetch("/find/updateName", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          mac: bulb.mac,
          new_name: new_name,

        }),

      });

      handleUpdateBulbState();

      console.log(response.status);


      const data = await response.json();
      console.log("Server Response:", data);
    } catch (error) {
      console.error("Error posting data:", error);
    }

  }


  const handleDeleteLight = async (bulb) => {
    try {
      const response = await apiFetch("/find/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mac: bulb.mac

        }),

      })

      const data = await response.json();
      console.log("Server Response:", data);

      if (window.electronAPI) window.electronAPI.macrosChanged();

      getMacros();

      handleUpdateBulbState();


    } catch (error) {
      console.error("Error posting data:", error);
    }

  }




  //pop up window

  function handlePopup() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }


  const handleBrightnessPreview = (bulb, newValue) => {
    setBulbStates(prev => ({
      ...prev,
      [bulb.mac]: { ...prev[bulb.mac], brightness: newValue }
    }));
  };


  const handleTempPreview = (bulb, newValue) => {
    setBulbStates(prev => ({
      ...prev,
      [bulb.mac]: { ...prev[bulb.mac], temp: newValue }
    }));
  };

  const handleColor = async (bulb, color) => {

    try {
      const response = await apiFetch("/bulb/Color", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: bulb.ip,
          r: color.r,
          g: color.g,
          b: color.b


        }),

      })

      const data = await response.json();
      console.log("Server Response:", data);



    } catch (error) {
      console.error("Error changing color:", error);
    }
  }


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const saveOrder = async (reorderlist) => {
    try {
      const response = await apiFetch("/find/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: reorderlist

        }),

      })


      const data = await response.json();
      console.log("Server Response:", data);



    } catch (error) {
      console.error("Error changing color:", error);
    }



  }



  const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log("FULL EVENT:", event);
    console.log("dragged mac (active.id):", active.id);
    console.log("dropped-on mac (over?.id):", over?.id);

    if (over && active.id !== over.id) {
      setSavedBulbs((bulbs) => {
        const oldIndex = bulbs.findIndex((b) => b.mac === active.id);
        const newIndex = bulbs.findIndex((b) => b.mac === over.id);
        console.log("oldIndex:", oldIndex, "newIndex:", newIndex);

        const reordered = arrayMove(bulbs, oldIndex, newIndex);
        console.log("NEW ORDER (macs):", reordered.map(b => b.mac));
        console.log("NEW ORDER (names):", reordered.map(b => b.name));

        saveOrder(reordered.map(b => b.mac))


        return reordered;
      });
    }
  };


  const handleAddGroup = async (groupName) => {
    try {
      const response = await apiFetch("/group/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ name: groupName }),
      });
      const data = await response.json();

      handleGetGroups();

      console.log("Server Response:", data);
    } catch (error) {
      console.error("Error creating group:", error);
    }



  }


  const handleUpdateGroupName = async (groupId, newName) => {
    try {
      const response = await apiFetch("/group/update_name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: groupId, new_name: newName })

      })
      const data = await response.json();

      handleGetGroups();

      console.log("Server Response:", data);

    } catch (error) {
      console.error("Error Updating Name:", error)
    }
  }


  const handleDeleteGroup = async (groupId) => {
    try {
      const response = await apiFetch("/group/delete", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: groupId })
      })
      const data = await response.json();

      handleGetGroups();

      setSelectedGroup({ name: "ALL", id: "0" });

      if (window.electronAPI) window.electronAPI.macrosChanged();

      getMacros();

      console.log("Server Response", data);

    } catch (error) {
      console.error("Error Removing Group", error)
    }
  }

  const handleUpdateGroup = async (mac, groupId) => {
    try {
      const response = await apiFetch("/find/update_group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac: mac, group_id: groupId })
      })
      const data = await response.json();
      handleUpdateBulbState();

      console.log("Server Response", data);
    } catch (error) {
      console.error("Error Adding To Group", error)
    }
  }




  const setMacro = async (targetType, targetId, action, key) => {
    try {
      await apiFetch("/macros/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: targetType,
          target_id: String(targetId),
          action: action,
          key: key,
        }),
      });

      getMacros();
      if (window.electronAPI) window.electronAPI.macrosChanged();
    } catch (error) {
      console.error("Error setting macro:", error);
    }
  };


  useEffect(() => {
    // run if EITHER modal is open
    if (!openEditGroupModal && !open) return;

    const fetchMacros = async () => {
      try {
        const { type, id } = macroTarget;
        if (!type || !id) return;   // target not resolvable yet

        setOnKey(null);            // reset BEFORE the fetch
        setOffKey(null);
        setOnMacroId(null);
        setOffMacroId(null);

        const response = await apiFetch(`/macros/for_target?target_type=${type}&target_id=${id}`
        );
        const data = await response.json();

        data.macros.forEach((macro) => {
          if (macro.action === "on") { setOnKey(macro.key); setOnMacroId(macro.id); }
          if (macro.action === "off") { setOffKey(macro.key); setOffMacroId(macro.id); }
        });
      } catch (error) {
        console.error("Error fetching macros:", error);
      }
    };

    fetchMacros();
  }, [openEditGroupModal, open, selectedGroup, editingBulb]);


  const clearMacro = async (macroId, action) => {
    await apiFetch("/macros/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: macroId }),
    });

    getMacros();
    if (action === "on") setOnKey(null);
    if (action === "off") setOffKey(null);
  };


  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.onBulbsChanged(() => {
      handleUpdateBulbState();
    });
  }, []);


  const getMacros = async () => {
    try {
      const response = await apiFetch("/macros/get", {
        method: "GET"
      });

      const data = await response.json();

      setSavedMacros(data.macros)

      console.log("Macros", data.macros)
    } catch (error) {
      console.error("Error fetching macros:", error)
    }
  }


  const handleScene = async (currentScene, selectedGroup) => {

    try {
      const response = await apiFetch("/bulb/scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: selectedGroup.id,
          scene_id: currentScene.id,
          scene_needs_rgb: currentScene.RGB_only
        }),
      });
      const data = await response.json();



      console.log("Scene", data.status)

    } catch (error) {
      console.error("Error setting scene", error)
    }


  }

  // Dispay saved on load

  useEffect(() => {
    handleSaved();
    handleGetGroups();
    getMacros();
  }, []);


  return (
    <>

      {isKeyListening && (<KeyboardListener />)}



      <Container >

        <Box sx={{ display: 'grid', gridTemplateColumns: '10fr 1fr', justifyContent: 'center', alignItems: 'center' }} >
          <Typography sx={{ fontSize: 60, fontWeight: 1000, fontFamily: MONO }}>Bulbs</Typography>

          <Button onClick={handleScannerOpen} variant='outlined'> Discover Lights</Button>

        </Box>

        <Divider></Divider>

        {loadingForSavedBulbs && (
          <Box sx={{ display: 'flex', alignItems: "center", justifyContent: 'center', pt: 10, flexDirection: 'column', gap: 3 }}>

            <BlinkBlur></BlinkBlur>

            <Typography sx={{ color: 'gray', fontFamily: MONO }} >Loading bulbs...</Typography>


          </Box>


        )}


        {savedBulbs.length === 0 && !loadingForSavedBulbs ?




          (



            <Box sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 4,
              mt: 4,
            }}>
              <Box sx={{
                width: 64, height: 64,
                mx: 'auto', mb: 2,
                borderRadius: '50%',
                bgcolor: 'rgba(107,164,232,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LightbulbIcon sx={{ fontSize: 30, color: 'primary.main', opacity: 0.8 }} />
              </Box>
              <Typography sx={{ ...MONO, fontSize: 18, fontWeight: 700, mb: 1 }}>
                No bulbs yet
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 14, maxWidth: 320, mx: 'auto', mb: 3 }}>
                Make sure your bulbs are set up in the WiZ app, then scan your network to add them here.
              </Typography>
              <Button variant="contained" onClick={handleScannerOpen}>
                Discover Lights
              </Button>
            </Box>


          )



          : (



            <Container sx={{ mt: 2 }}>



              <Box sx={{ display: 'flex', flexDirection: "row", gap: 4 }}>

                <GroupSelector
                  selectedGroup={selectedGroup}
                  onGroupSelect={setSelectedGroup}
                  groups={groups}
                  addGroup={handleOpenGroupModal}

                />

                <IconButton onClick={() => { console.log(selectedGroup); setEditingGroupName(selectedGroup.name); handleOpenEditGroupModal(); }} sx={{ color: 'text.secondary' }}><SettingsIcon /> </IconButton>



              </Box>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={savedBulbs.map((b) => b.mac)}
                  strategy={rectSortingStrategy}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mt: 2 }}>

                    {savedBulbs
                      .filter(bulb =>
                        selectedGroup.id == "0" || bulb.group_id == selectedGroup.id
                      ).map((bulb) => {
                        const bulbState = bulbStates[bulb.mac] ?? { isOn: false, brightness: 50 };
                        return (
                          <SortableBulb
                            key={bulb.mac}
                            bulb={bulb}
                            bulbState={bulbState}
                            onToggle={togglePower}
                            onBrightnessPreview={handleBrightnessPreview}
                            onBrightnessChange={handleBrightnessChange}
                            onTempPreview={handleTempPreview}
                            onTempChange={handleTempChange}
                            onColorChange={handleColor}
                            handleSaved={handleUpdateBulbState}
                            onEdit={() => {
                              setEditingBulb(bulb);
                              setName(bulb.name);
                              setSelectedGroupLight(bulb.group_id ?? "");


                              setMacroTarget({
                                type: "bulb",
                                id: bulb.mac,
                              });



                              handleOpen();

                            }}
                          />
                        );
                      })}

                  </Box>
                </SortableContext>
              </DndContext>



            </Container>

          )


        }

        <AnimatePresence>
          {showToast && <PopUp text={popUpText} />}
        </AnimatePresence>



        {/* Edit Modal */}

        <EditModal

          open={open}
          handleClose={handleClose}
          name={name}
          setName={setName}
          setPopUpText={setPopUpText}
          handlePopup={handlePopup}
          handleDeleteLight={handleDeleteLight}
          editingBulb={editingBulb}
          handleUpdateName={handleUpdateName}
          handleSaved={handleUpdateBulbState}
          groups={groups}
          selectedGroup={selectedGroupLight}
          setSelectedGroup={setSelectedGroupLight}
          handleUpdateGroup={handleUpdateGroup}
          onKey={onKey}
          offKey={offKey}
          isKeyListening={isKeyListening}
          setIsKeyListening={setIsKeyListening}
          clearMacro={clearMacro}
          onMacroId={onMacroId}
          offMacroId={offMacroId}
          savedMacros={savedMacros}
          macroError={macroError}
          setMacro={setMacro}


        />


        {/* Discover Model */}


        <DiscoverModal
          scannerOpen={scannerOpen}
          handleScannerClose={handleScannerClose}
          loading={loading}
          discoveredBulbs={discoveredBulbs}
          attempedScan={attempedScan}
          setattempedScan={setattempedScan}
          handleScan={handleScan}
          handleAddBulb={handleAddBulb}
          handleSaved={handleUpdateBulbState}
          savedBulbs={savedBulbs}
        />



        {/* Add Group Modal */}


        <AddGroupModal
          open={openGroupModal}
          handleClose={handleCloseGroupModal}
          name={groupName}
          setName={setGroupname}
          addGroup={() => handleAddGroup(groupName)}

        />

        {/* Edit Group Modal*/}


        <EditGroupModal
          open={openEditGroupModal}
          close={handleCloseEditGroupModal}
          selectedGroupName={editingGroupName}
          setGroupName={setEditingGroupName}
          handleUpdateGroup={handleUpdateGroupName}
          selectedGroup={selectedGroup}
          handleDelete={handleDeleteGroup}
          isKeyListening={isKeyListening}
          setIsKeyListening={setIsKeyListening}
          onKey={onKey}
          offKey={offKey}
          setMacro={setMacro}
          clearMacro={clearMacro}
          onMacroId={onMacroId}
          offMacroId={offMacroId}
          savedMacros={savedMacros}
          macroError={macroError}

        />




        {savedBulbs.length !== 0 &&
          <>

            < Divider sx={{ mt: 2 }}></Divider>

            <Typography sx={{ fontSize: 60, fontWeight: 1000, fontFamily: MONO }}>
              Wiz Scenes
            </Typography>


            <Box sx={{

              display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap',
              height: 450,
              overflowY: 'auto',

              '&::-webkit-scrollbar': {
                width: 8,
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 999,
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(255,255,255,0.25)',
              },


            }}>


              {
                SCENES.map((scene) => {

                  return (

                    <Paper
                      key={scene.id}
                      onClick={() => { setScene(scene); handleScene(scene, selectedGroup); }}
                      sx={{
                        width: 200,
                        height: 80,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        borderRadius: 3,
                        paddingTop: 1.5,
                        backgroundImage: `linear-gradient(to right, ${scene.colors})`,
                      }}
                    >
                      <Box>

                        <Typography sx={{ font: MONO, ml: 2, fontWeight: 1000, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{scene.name}</Typography>

                        <Box sx={{ ml: 1, gap: 1, display: 'flex' }}>


                          {scene.RGB_only && <Chip label='RGB'> </Chip>}

                          {scene.Dynamic && <Chip label='Dynamic'> </Chip>}



                        </Box>

                      </Box>

                    </Paper>


                  )

                })
              }




            </Box>

          </>

        }


      </Container >


    </>
  )
}

export default Bulbs
