/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { StarSystem, CelestialBody, Language } from './types/space';
import {
  loadSavedSystems,
  saveSystems,
  getActiveSystemId,
  setActiveSystemId,
  generateRandomStarSystem,
} from './utils/storage';
import { TRANSLATIONS } from './data/translations';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { CosmosCanvas } from './components/CosmosCanvas';
import { ControlBar } from './components/ControlBar';
import { BodyDetailsPanel } from './components/BodyDetailsPanel';
import { CreatePlanetModal } from './components/CreatePlanetModal';
import { CreateSystemModal } from './components/CreateSystemModal';
import { RenameSystemModal } from './components/RenameSystemModal';
import { ConfirmModal } from './components/ConfirmModal';

export default function App() {
  // 1. Language state
  const [language, setLanguage] = useState<Language>('en');
  const t = TRANSLATIONS[language];

  // 2. Systems state with local persistence
  const [systems, setSystems] = useState<StarSystem[]>(() => loadSavedSystems());
  const [activeSystemId, setActiveSystemIdState] = useState<string>(() => getActiveSystemId());

  // Derive active star system safely
  const activeSystem = useMemo(() => {
    return systems.find((s) => s.id === activeSystemId) || systems[0];
  }, [systems, activeSystemId]);

  // Persist systems whenever they change
  useEffect(() => {
    saveSystems(systems);
  }, [systems]);

  // Persist active system selection
  useEffect(() => {
    setActiveSystemId(activeSystem.id);
  }, [activeSystem.id]);

  // 3. 3D Interaction and Simulation Controls
  const [selectedBody, setSelectedBody] = useState<CelestialBody | 'star' | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1.0);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [focusTrigger, setFocusTrigger] = useState<number>(0);

  // 4. Navigation & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // 5. Modals State
  const [isCreatePlanetOpen, setIsCreatePlanetOpen] = useState<boolean>(false);
  const [editingPlanet, setEditingPlanet] = useState<CelestialBody | null>(null);
  const [isCreateSystemOpen, setIsCreateSystemOpen] = useState<boolean>(false);
  const [renamingSystem, setRenamingSystem] = useState<StarSystem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'system' | 'planet';
    id: string;
  } | null>(null);

  // Switch systems handler
  const handleSelectSystem = useCallback((system: StarSystem) => {
    setActiveSystemIdState(system.id);
    setSelectedBody(null);
    setIsFollowing(false);
  }, []);

  // Body selection handler
  const handleSelectBody = useCallback((body: CelestialBody | 'star' | null) => {
    setSelectedBody(body);
    if (!body) {
      setIsFollowing(false);
    }
  }, []);

  // Search jump handler
  const handleSelectSearchResult = useCallback(
    (id: string) => {
      if (id === 'star') {
        setSelectedBody('star');
      } else {
        const found = activeSystem.planets.find((p) => p.id === id);
        if (found) {
          setSelectedBody(found);
        }
      }
      setFocusTrigger((prev) => prev + 1);
    },
    [activeSystem]
  );

  // Reset Camera
  const handleResetCamera = useCallback(() => {
    setSelectedBody(null);
    setIsFollowing(false);
    setFocusTrigger((prev) => prev + 1);
  }, []);

  // Focus on Star
  const handleFocusStar = useCallback(() => {
    setSelectedBody('star');
    setIsFollowing(false);
    setFocusTrigger((prev) => prev + 1);
  }, []);

  // Focus on current selected body
  const handleFocusBody = useCallback(() => {
    setFocusTrigger((prev) => prev + 1);
  }, []);

  // Random System Generation
  const handleGenerateRandomSystem = useCallback(() => {
    const randomSystem = generateRandomStarSystem();
    setSystems((prev) => [...prev, randomSystem]);
    setActiveSystemIdState(randomSystem.id);
    setSelectedBody(null);
    setIsFollowing(false);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.15 },
        colors: ['#38BDF8', '#818CF8', '#F59E0B'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  // Create or Update Planet in the current system
  const handleSavePlanet = useCallback(
    (planetData: Partial<CelestialBody>) => {
      if (editingPlanet) {
        // Edit existing planet
        setSystems((prev) =>
          prev.map((sys) => {
            if (sys.id !== activeSystem.id) return sys;
            const updatedPlanets = sys.planets.map((p) => {
              if (p.id !== editingPlanet.id) return p;
              return { ...p, ...planetData } as CelestialBody;
            });
            return { ...sys, planets: updatedPlanets };
          })
        );
        // Update selected body if it's currently inspected
        if (selectedBody && typeof selectedBody !== 'string' && selectedBody.id === editingPlanet.id) {
          setSelectedBody((prev) =>
            prev && typeof prev !== 'string' ? ({ ...prev, ...planetData } as CelestialBody) : null
          );
        }
      } else {
        // Create new planet
        const newPlanet: CelestialBody = {
          id: `planet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: planetData.name || 'New Planet',
          type: planetData.type || 'rocky',
          color: planetData.color || '#38BDF8',
          secondaryColor: planetData.secondaryColor || '#1E293B',
          size: planetData.size || 1.2,
          distance: planetData.distance || 35,
          speed: planetData.speed || 0.8,
          rotationSpeed: planetData.rotationSpeed || 0.015,
          hasRings: !!planetData.hasRings,
          ringInnerRadius: planetData.ringInnerRadius,
          ringOuterRadius: planetData.ringOuterRadius,
          ringColor: planetData.ringColor,
          moons: planetData.moons || [],
          isUserCreated: true,
          descriptionEn: planetData.descriptionEn || 'A newly discovered planetary body.',
          descriptionAr: planetData.descriptionAr || 'جرم كوكبي تم اكتشافه حديثاً.',
          realDiameterKm: `${Math.round((planetData.size || 1.2) * 12000)} km`,
          orbitalPeriodDays: `${Math.round((planetData.distance || 35) * 14)} days`,
        };

        setSystems((prev) =>
          prev.map((sys) => {
            if (sys.id !== activeSystem.id) return sys;
            return { ...sys, planets: [...sys.planets, newPlanet] };
          })
        );
        setSelectedBody(newPlanet);
        setFocusTrigger((prev) => prev + 1);
      }

      setEditingPlanet(null);
    },
    [activeSystem.id, editingPlanet, selectedBody]
  );

  // Delete Planet confirmation
  const handleRequestDeletePlanet = useCallback((planetId: string) => {
    setConfirmDelete({ type: 'planet', id: planetId });
  }, []);

  // Create Universe / System
  const handleCreateSystem = useCallback((newSystem: StarSystem) => {
    setSystems((prev) => [...prev, newSystem]);
    setActiveSystemIdState(newSystem.id);
    setSelectedBody(null);
    setIsFollowing(false);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.2 },
        colors: ['#6366F1', '#38BDF8', '#E0E7FF'],
      });
    } catch {
      // Fallback
    }
  }, []);

  // Rename System
  const handleRenameSystem = useCallback((systemId: string, newName: string) => {
    setSystems((prev) =>
      prev.map((sys) => (sys.id === systemId ? { ...sys, name: newName } : sys))
    );
  }, []);

  // Delete System confirmation
  const handleRequestDeleteSystem = useCallback((systemId: string) => {
    setConfirmDelete({ type: 'system', id: systemId });
  }, []);

  // Execute confirmed deletion
  const handleConfirmDelete = useCallback(() => {
    if (!confirmDelete) return;

    if (confirmDelete.type === 'system') {
      const remaining = systems.filter((s) => s.id !== confirmDelete.id);
      setSystems(remaining);
      setActiveSystemIdState(remaining[0]?.id || 'real-solar-system');
      setSelectedBody(null);
    } else if (confirmDelete.type === 'planet') {
      setSystems((prev) =>
        prev.map((sys) => {
          if (sys.id !== activeSystem.id) return sys;
          return {
            ...sys,
            planets: sys.planets.filter((p) => p.id !== confirmDelete.id),
          };
        })
      );
      if (selectedBody && typeof selectedBody !== 'string' && selectedBody.id === confirmDelete.id) {
        setSelectedBody(null);
        setIsFollowing(false);
      }
    }

    setConfirmDelete(null);
  }, [confirmDelete, systems, activeSystem.id, selectedBody]);

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans"
    >
      {/* Top Bar Navigation */}
      <TopNav
        currentSystem={activeSystem}
        language={language}
        onLanguageChange={setLanguage}
        onOpenCreatePlanet={() => {
          setEditingPlanet(null);
          setIsCreatePlanetOpen(true);
        }}
        onOpenCreateSystem={() => setIsCreateSystemOpen(true)}
        onGenerateRandom={handleGenerateRandomSystem}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectSearchResult={handleSelectSearchResult}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Systems Sidebar */}
        <Sidebar
          systems={systems}
          activeSystemId={activeSystem.id}
          onSelectSystem={handleSelectSystem}
          onOpenCreateSystem={() => setIsCreateSystemOpen(true)}
          onGenerateRandom={handleGenerateRandomSystem}
          onRenameSystem={(sys) => setRenamingSystem(sys)}
          onDeleteSystem={handleRequestDeleteSystem}
          language={language}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* 3D Cosmos Space Viewport */}
        <main className="relative flex-1 h-full w-full bg-slate-950 overflow-hidden">
          <CosmosCanvas
            system={activeSystem}
            selectedBodyId={selectedBody ? (selectedBody === 'star' ? 'star' : selectedBody.id) : null}
            onSelectBody={handleSelectBody}
            isPlaying={isPlaying}
            simulationSpeed={simulationSpeed}
            showOrbits={showOrbits}
            showLabels={showLabels}
            isFollowing={isFollowing}
            focusTrigger={focusTrigger}
          />

          {/* Floating Simulation Controls HUD */}
          <ControlBar
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((prev) => !prev)}
            simulationSpeed={simulationSpeed}
            onSpeedChange={setSimulationSpeed}
            onResetCamera={handleResetCamera}
            showOrbits={showOrbits}
            onToggleOrbits={() => setShowOrbits((prev) => !prev)}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels((prev) => !prev)}
            onFocusStar={handleFocusStar}
            language={language}
          />

          {/* Celestial Body Inspector Floating HUD */}
          <BodyDetailsPanel
            body={selectedBody}
            star={activeSystem.star}
            language={language}
            onClose={() => {
              setSelectedBody(null);
              setIsFollowing(false);
            }}
            onFocus={handleFocusBody}
            isFollowing={isFollowing}
            onToggleFollow={() => setIsFollowing((prev) => !prev)}
            onEditPlanet={(planet) => {
              setEditingPlanet(planet);
              setIsCreatePlanetOpen(true);
            }}
            onDeletePlanet={handleRequestDeletePlanet}
          />
        </main>
      </div>

      {/* Modals & Dialogs */}
      <CreatePlanetModal
        isOpen={isCreatePlanetOpen}
        onClose={() => {
          setIsCreatePlanetOpen(false);
          setEditingPlanet(null);
        }}
        onSubmit={handleSavePlanet}
        existingPlanets={activeSystem.planets}
        editingPlanet={editingPlanet}
        language={language}
      />

      <CreateSystemModal
        isOpen={isCreateSystemOpen}
        onClose={() => setIsCreateSystemOpen(false)}
        onSubmit={handleCreateSystem}
        language={language}
      />

      <RenameSystemModal
        isOpen={!!renamingSystem}
        onClose={() => setRenamingSystem(null)}
        system={renamingSystem}
        onRename={handleRenameSystem}
        language={language}
      />

      <ConfirmModal
        isOpen={!!confirmDelete}
        title={confirmDelete?.type === 'system' ? t.deleteSystem : t.deletePlanet}
        message={
          confirmDelete?.type === 'system'
            ? t.confirmDeleteSystem
            : t.confirmDeletePlanet
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
        language={language}
      />
    </div>
  );
}
