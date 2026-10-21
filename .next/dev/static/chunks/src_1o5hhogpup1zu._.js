(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
(()=>{"use strict";return[
"[project]/src/App.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>App
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$DataContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/DataContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/Sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/Navbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$AuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/auth/AuthModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$HomepageView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/views/HomepageView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$AuthView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/views/AuthView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$ErrorView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/views/ErrorView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$DashboardView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/views/DashboardView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$UploadDatasetView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/views/UploadDatasetView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$SalesAnalysisView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/views/SalesAnalysisView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$ForecastAnomaliesView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/views/ForecastAnomaliesView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$AskYourDataView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/views/AskYourDataView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$ReportsView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/views/ReportsView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$SettingsView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/views/SettingsView.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// Workspace pages that require a signed-in user
const PROTECTED_TABS = [
    'dashboard',
    'upload',
    'sales-analysis',
    'forecast-anomalies',
    'ask-data',
    'reports',
    'settings'
];
function AppContent() {
    _s();
    const [currentTab, setCurrentTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('home');
    const [pendingTab, setPendingTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mobileOpen, setMobileOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sidebarHidden, setSidebarHidden] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "AppContent.useState": ()=>{
            try {
                return localStorage.getItem('abip_sidebar_hidden') === 'true';
            } catch  {
                return false;
            }
        }
    }["AppContent.useState"]);
    const { loaded, refresh, backendUp } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$DataContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useData"])();
    const { isAuthenticated, openAuthModal } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const toggleSidebar = ()=>{
        setSidebarHidden((prev)=>{
            const next = !prev;
            try {
                localStorage.setItem('abip_sidebar_hidden', String(next));
            } catch  {}
            return next;
        });
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "AppContent.useEffect": ()=>{
            const handleKeyDown = {
                "AppContent.useEffect.handleKeyDown": (e)=>{
                    // Ctrl+B or Cmd+B to toggle sidebar visibility
                    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                        e.preventDefault();
                        toggleSidebar();
                    }
                }
            }["AppContent.useEffect.handleKeyDown"];
            const handleExternalToggle = {
                "AppContent.useEffect.handleExternalToggle": ()=>{
                    try {
                        setSidebarHidden(localStorage.getItem('abip_sidebar_hidden') === 'true');
                    } catch  {}
                }
            }["AppContent.useEffect.handleExternalToggle"];
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('abip:sidebar-toggle', handleExternalToggle);
            return ({
                "AppContent.useEffect": ()=>{
                    window.removeEventListener('keydown', handleKeyDown);
                    window.removeEventListener('abip:sidebar-toggle', handleExternalToggle);
                }
            })["AppContent.useEffect"];
        }
    }["AppContent.useEffect"], []);
    // Navigate to a tab; protected tabs open the sign-in modal for signed-out users
    // and remember where the user wanted to go.
    const goToTab = (tab)=>{
        if (PROTECTED_TABS.includes(tab) && !isAuthenticated) {
            setPendingTab(tab);
            openAuthModal('signin');
            return;
        }
        setCurrentTab(tab);
    };
    // After sign-in: go to the page the user originally clicked, else upload/dashboard
    const handleAuthSuccess = ()=>{
        if (pendingTab) {
            setCurrentTab(pendingTab);
            setPendingTab(null);
        } else {
            setCurrentTab(loaded ? 'dashboard' : 'upload');
        }
    };
    // Safety net: a signed-out user can never see a workspace page
    // (covers logout while inside the workspace). Renders the homepage instead.
    const blocked = PROTECTED_TABS.includes(currentTab) && !isAuthenticated;
    // If on homepage, render full-bleed marketing and interactive demo homepage
    if (currentTab === 'home' || blocked) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$HomepageView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HomepageView"], {
                    onLaunchPlatform: (tab = 'upload')=>goToTab(tab)
                }, void 0, false, {
                    fileName: "[project]/src/App.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$AuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthModal"], {
                    onAuthSuccess: handleAuthSuccess
                }, void 0, false, {
                    fileName: "[project]/src/App.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/App.tsx",
            lineNumber: 104,
            columnNumber: 7
        }, this);
    }
    // Public: Dedicated Split-Layout Sign In & Sign Up Screen
    if (currentTab === 'signin' || currentTab === 'signup') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$AuthView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthView"], {
            initialMode: currentTab,
            onNavigateHome: ()=>setCurrentTab('home'),
            onAuthSuccess: handleAuthSuccess
        }, void 0, false, {
            fileName: "[project]/src/App.tsx",
            lineNumber: 114,
            columnNumber: 7
        }, this);
    }
    // Public: 404 Discontinuity Screen
    if (currentTab === '404') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$ErrorView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorView"], {
            type: "404",
            onNavigateHome: ()=>setCurrentTab('home')
        }, void 0, false, {
            fileName: "[project]/src/App.tsx",
            lineNumber: 125,
            columnNumber: 7
        }, this);
    }
    // Public: Server Unreachable / Offline Screen
    if (currentTab === 'offline') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$ErrorView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorView"], {
            type: "offline",
            onNavigateHome: ()=>setCurrentTab('home'),
            onRetry: async ()=>{
                await refresh();
                if (backendUp) setCurrentTab('dashboard');
            }
        }, void 0, false, {
            fileName: "[project]/src/App.tsx",
            lineNumber: 135,
            columnNumber: 7
        }, this);
    }
    // Otherwise, render full Enterprise AI Platform workspace layout
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors font-sans",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sidebar"], {
                currentTab: currentTab,
                onSelectTab: (tab)=>setCurrentTab(tab),
                mobileOpen: mobileOpen,
                onCloseMobile: ()=>setMobileOpen(false),
                sidebarHidden: sidebarHidden,
                onToggleSidebar: toggleSidebar
            }, void 0, false, {
                fileName: "[project]/src/App.tsx",
                lineNumber: 149,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${sidebarHidden ? 'md:pl-0' : 'md:pl-64'} transition-[padding] duration-300 ease-in-out flex flex-col min-h-screen`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Navbar"], {
                        currentTab: currentTab,
                        onOpenMobile: ()=>setMobileOpen(true),
                        sidebarHidden: sidebarHidden,
                        onToggleSidebar: toggleSidebar,
                        onGoToUpload: ()=>setCurrentTab('upload'),
                        onGoToHome: ()=>setCurrentTab('home'),
                        onGoToSettings: ()=>setCurrentTab('settings')
                    }, void 0, false, {
                        fileName: "[project]/src/App.tsx",
                        lineNumber: 163,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 p-4 md:p-8",
                        children: [
                            currentTab === 'dashboard' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$DashboardView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DashboardView"], {
                                onNavigate: (tab)=>setCurrentTab(tab)
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 175,
                                columnNumber: 13
                            }, this),
                            currentTab === 'upload' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$UploadDatasetView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UploadDatasetView"], {
                                onNavigate: (tab)=>setCurrentTab(tab)
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 178,
                                columnNumber: 13
                            }, this),
                            currentTab === 'sales-analysis' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$SalesAnalysisView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SalesAnalysisView"], {
                                onNavigate: (tab)=>setCurrentTab(tab)
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 181,
                                columnNumber: 13
                            }, this),
                            currentTab === 'forecast-anomalies' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$ForecastAnomaliesView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ForecastAnomaliesView"], {
                                onNavigate: (tab)=>setCurrentTab(tab)
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 184,
                                columnNumber: 13
                            }, this),
                            currentTab === 'ask-data' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$AskYourDataView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AskYourDataView"], {
                                onNavigate: (tab)=>setCurrentTab(tab)
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 187,
                                columnNumber: 13
                            }, this),
                            currentTab === 'reports' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$ReportsView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReportsView"], {
                                onNavigate: (tab)=>setCurrentTab(tab)
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 190,
                                columnNumber: 13
                            }, this),
                            currentTab === 'settings' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$SettingsView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SettingsView"], {}, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 192,
                                columnNumber: 41
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/App.tsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/App.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$AuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthModal"], {
                onAuthSuccess: handleAuthSuccess
            }, void 0, false, {
                fileName: "[project]/src/App.tsx",
                lineNumber: 196,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/App.tsx",
        lineNumber: 148,
        columnNumber: 5
    }, this);
}
_s(AppContent, "0v0CwIeCiXCZ4h340TdCoEMLkGo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$DataContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useData"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = AppContent;
function App() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$DataContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DataProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContent, {}, void 0, false, {
                fileName: "[project]/src/App.tsx",
                lineNumber: 205,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/App.tsx",
            lineNumber: 204,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/App.tsx",
        lineNumber: 203,
        columnNumber: 5
    }, this);
}
_c1 = App;
var _c, _c1;
__turbopack_context__.k.register(_c, "AppContent");
__turbopack_context__.k.register(_c1, "App");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/api/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Unified API Client Module
 * Provides a single abstraction layer for all network data access.
 * Toggle `USE_MOCK = false` to connect seamlessly to production Express backend without touching UI components.
 */ __turbopack_context__.s([
    "MOCK_SECTORS",
    ()=>MOCK_SECTORS,
    "USE_MOCK",
    ()=>USE_MOCK,
    "getSectorOverview",
    ()=>getSectorOverview,
    "queryNaturalLanguage",
    ()=>queryNaturalLanguage
]);
const USE_MOCK = true;
const MOCK_SECTORS = {
    apparel: {
        sectorId: 'apparel',
        sectorName: 'Omnichannel Apparel & Footwear',
        timeframe: 'FY 2026 (Sample Data)',
        isMockSample: true,
        kpis: {
            grossRevenue: 1842950,
            momGrowthPercent: 14.2,
            averageOrderValue: 78.4,
            totalOrders: 23507,
            anomalyCount: 3
        },
        monthlyRevenueSeries: [
            {
                month: 'Jan',
                actual: 124000
            },
            {
                month: 'Feb',
                actual: 131500
            },
            {
                month: 'Mar',
                actual: 142800
            },
            {
                month: 'Apr',
                actual: 139200
            },
            {
                month: 'May',
                actual: 154100
            },
            {
                month: 'Jun',
                actual: 162400
            },
            {
                month: 'Jul',
                actual: 158900
            },
            {
                month: 'Aug',
                actual: 149300,
                isAnomaly: true
            },
            {
                month: 'Sep',
                actual: 171200
            },
            {
                month: 'Oct',
                actual: 185600
            },
            {
                month: 'Nov',
                actual: 210400,
                forecast: 208500,
                confidenceLower: 198000,
                confidenceUpper: 219000
            },
            {
                month: 'Dec',
                actual: 235800,
                forecast: 231000,
                confidenceLower: 219000,
                confidenceUpper: 243000
            }
        ],
        categoryMix: [
            {
                category: 'Outerwear & Jackets',
                sharePercent: 38,
                revenue: 700321,
                growthPercent: 18.5
            },
            {
                category: 'Footwear & Athletic',
                sharePercent: 27,
                revenue: 497596,
                growthPercent: 12.1
            },
            {
                category: 'Denim & Essentials',
                sharePercent: 21,
                revenue: 387019,
                growthPercent: 8.4
            },
            {
                category: 'Accessories',
                sharePercent: 14,
                revenue: 258013,
                growthPercent: 6.2
            }
        ],
        outliersDetected: [
            {
                date: '2026-08-14',
                amount: 3200,
                expectedMedian: 5200,
                madZScore: -3.8,
                anomalyType: 'Dip'
            },
            {
                date: '2026-10-24',
                amount: 9800,
                expectedMedian: 5900,
                madZScore: 4.1,
                anomalyType: 'Spike'
            },
            {
                date: '2026-11-27',
                amount: 14200,
                expectedMedian: 6800,
                madZScore: 4.9,
                anomalyType: 'Spike'
            }
        ],
        modelComparison: {
            selectedModel: 'Holt-Winters (Additive)',
            mapeScore: 4.62,
            recommendation: 'Additive seasonality fits steady baseline growth with predictable holiday uplift.'
        }
    },
    electronics: {
        sectorId: 'electronics',
        sectorName: 'Consumer Electronics & Smart Devices',
        timeframe: 'FY 2026 (Sample Data)',
        isMockSample: true,
        kpis: {
            grossRevenue: 4291800,
            momGrowthPercent: 8.6,
            averageOrderValue: 312.5,
            totalOrders: 13733,
            anomalyCount: 2
        },
        monthlyRevenueSeries: [
            {
                month: 'Jan',
                actual: 310000
            },
            {
                month: 'Feb',
                actual: 295000
            },
            {
                month: 'Mar',
                actual: 340000
            },
            {
                month: 'Apr',
                actual: 322000
            },
            {
                month: 'May',
                actual: 358000
            },
            {
                month: 'Jun',
                actual: 375000
            },
            {
                month: 'Jul',
                actual: 360000
            },
            {
                month: 'Aug',
                actual: 345000
            },
            {
                month: 'Sep',
                actual: 410000
            },
            {
                month: 'Oct',
                actual: 425000
            },
            {
                month: 'Nov',
                actual: 490000,
                forecast: 485000,
                confidenceLower: 460000,
                confidenceUpper: 510000
            },
            {
                month: 'Dec',
                actual: 520000,
                forecast: 515000,
                confidenceLower: 490000,
                confidenceUpper: 540000
            }
        ],
        categoryMix: [
            {
                category: 'Audio & Wearables',
                sharePercent: 42,
                revenue: 1802556,
                growthPercent: 14.8
            },
            {
                category: 'Smart Home & Sensors',
                sharePercent: 28,
                revenue: 1201704,
                growthPercent: 9.3
            },
            {
                category: 'Computing & Monitors',
                sharePercent: 18,
                revenue: 772524,
                growthPercent: 5.1
            },
            {
                category: 'Cables & Power',
                sharePercent: 12,
                revenue: 515016,
                growthPercent: 4.0
            }
        ],
        outliersDetected: [
            {
                date: '2026-09-18',
                amount: 28900,
                expectedMedian: 12400,
                madZScore: 4.6,
                anomalyType: 'Spike'
            },
            {
                date: '2026-11-28',
                amount: 34100,
                expectedMedian: 15200,
                madZScore: 5.2,
                anomalyType: 'Spike'
            }
        ],
        modelComparison: {
            selectedModel: 'Holt-Winters (Multiplicative)',
            mapeScore: 3.84,
            recommendation: 'Multiplicative model captures escalating Black Friday and Q4 multiplier dynamics.'
        }
    },
    grocery: {
        sectorId: 'grocery',
        sectorName: 'Organic Grocery & Fresh Essentials',
        timeframe: 'FY 2026 (Sample Data)',
        isMockSample: true,
        kpis: {
            grossRevenue: 890450,
            momGrowthPercent: 3.4,
            averageOrderValue: 42.1,
            totalOrders: 21150,
            anomalyCount: 1
        },
        monthlyRevenueSeries: [
            {
                month: 'Jan',
                actual: 68000
            },
            {
                month: 'Feb',
                actual: 69500
            },
            {
                month: 'Mar',
                actual: 72000
            },
            {
                month: 'Apr',
                actual: 71500
            },
            {
                month: 'May',
                actual: 74200
            },
            {
                month: 'Jun',
                actual: 76000
            },
            {
                month: 'Jul',
                actual: 75500
            },
            {
                month: 'Aug',
                actual: 73000
            },
            {
                month: 'Sep',
                actual: 77800
            },
            {
                month: 'Oct',
                actual: 79200
            },
            {
                month: 'Nov',
                actual: 82500,
                forecast: 81800,
                confidenceLower: 78000,
                confidenceUpper: 85500
            },
            {
                month: 'Dec',
                actual: 86000,
                forecast: 85200,
                confidenceLower: 81000,
                confidenceUpper: 89000
            }
        ],
        categoryMix: [
            {
                category: 'Fresh Produce & Fruit',
                sharePercent: 45,
                revenue: 400702,
                growthPercent: 4.2
            },
            {
                category: 'Pantry & Bulk Goods',
                sharePercent: 25,
                revenue: 222612,
                growthPercent: 2.8
            },
            {
                category: 'Artisan Bakery',
                sharePercent: 18,
                revenue: 160281,
                growthPercent: 3.1
            },
            {
                category: 'Cold Beverages',
                sharePercent: 12,
                revenue: 106854,
                growthPercent: 1.9
            }
        ],
        outliersDetected: [
            {
                date: '2026-11-25',
                amount: 7200,
                expectedMedian: 2600,
                madZScore: 4.3,
                anomalyType: 'Spike'
            }
        ],
        modelComparison: {
            selectedModel: 'Linear Trend',
            mapeScore: 2.91,
            recommendation: 'Linear trend captures weekly repeat purchasing cycles with low seasonal variance.'
        }
    }
};
async function getSectorOverview(sectorId = 'apparel') {
    if ("TURBOPACK compile-time truthy", 1) {
        await new Promise((resolve)=>setTimeout(resolve, 80));
        return MOCK_SECTORS[sectorId] || MOCK_SECTORS.apparel;
    }
    //TURBOPACK unreachable
    ;
    const res = undefined;
}
async function queryNaturalLanguage(queryText, sectorId = 'apparel') {
    if ("TURBOPACK compile-time truthy", 1) {
        await new Promise((resolve)=>setTimeout(resolve, 120));
        const clean = queryText.toLowerCase();
        if (clean.includes('margin') || clean.includes('highest') || clean.includes('category')) {
            return {
                query: queryText,
                answer: 'Outerwear & Jackets delivered the highest gross revenue at $700,321 (38% category share) with an 18.5% year-over-year expansion rate.',
                groundingMetric: 'Category Share: 38.0% · Revenue: $700.3k · Unit Velocity: +18.5%',
                sourceRowsEvaluated: 23507,
                sampleDataNotice: 'Sample data: Verified across 23,507 simulated transactions'
            };
        }
        if (clean.includes('outlier') || clean.includes('spike') || clean.includes('drop')) {
            return {
                query: queryText,
                answer: 'Two prominent positive spikes were flagged on Oct 24 ($9,800) and Nov 27 ($14,200), exceeding the 3.5 MAD modified z-score threshold.',
                groundingMetric: 'MAD Threshold: 3.5σ · Peak z-score: 4.9 · Baseline Delta: +108%',
                sourceRowsEvaluated: 365,
                sampleDataNotice: 'Sample data: Evaluated via rolling 31-day Median Absolute Deviation'
            };
        }
        return {
            query: queryText,
            answer: `Analysis of ${MOCK_SECTORS[sectorId]?.sectorName || 'retail operations'} shows resilient month-over-month trajectory with average basket size at $${MOCK_SECTORS[sectorId]?.kpis.averageOrderValue || 78.4}.`,
            groundingMetric: `AOV: $${MOCK_SECTORS[sectorId]?.kpis.averageOrderValue || 78.4} · MoM: +${MOCK_SECTORS[sectorId]?.kpis.momGrowthPercent || 14.2}%`,
            sourceRowsEvaluated: 18450,
            sampleDataNotice: 'Sample data: Synthesized across retail demographic cohorts'
        };
    }
    //TURBOPACK unreachable
    ;
    const res = undefined;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "DEMO_PROFILES",
    ()=>DEMO_PROFILES,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
const STORAGE_KEY = 'abip_auth_user';
const DEMO_PROFILES = {
    analyst: {
        id: 'usr_analyst',
        name: 'Enterprise Data Analyst',
        email: 'analyst@retailbi.ai',
        role: 'Senior Business Intelligence Lead',
        company: 'Global Retail Corp',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        joinedAt: 'October 2026'
    },
    executive: {
        id: 'usr_executive',
        name: 'Retail Strategy Director',
        email: 'director@retailbi.ai',
        role: 'Commercial Strategy & Forecasting Lead',
        company: 'Global Retail Corp',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        joinedAt: 'October 2026'
    },
    // Backward compatibility keys for existing storage sessions
    shreyas: {
        id: 'usr_analyst',
        name: 'Enterprise Data Analyst',
        email: 'analyst@retailbi.ai',
        role: 'Senior Business Intelligence Lead',
        company: 'Global Retail Corp',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        joinedAt: 'October 2026'
    },
    saniya: {
        id: 'usr_executive',
        name: 'Retail Strategy Director',
        email: 'director@retailbi.ai',
        role: 'Commercial Strategy & Forecasting Lead',
        company: 'Global Retail Corp',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        joinedAt: 'October 2026'
    },
    shlok: {
        id: 'usr_analyst',
        name: 'Enterprise Data Analyst',
        email: 'analyst@retailbi.ai',
        role: 'Senior Business Intelligence Lead',
        company: 'Global Retail Corp',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        joinedAt: 'October 2026'
    },
    navya: {
        id: 'usr_executive',
        name: 'Retail Strategy Director',
        email: 'director@retailbi.ai',
        role: 'Commercial Strategy & Forecasting Lead',
        company: 'Global Retail Corp',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        joinedAt: 'October 2026'
    }
};
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const USERS_STORAGE_KEY = 'abip_registered_users';
const AuthProvider = ({ children })=>{
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "AuthProvider.useState": ()=>{
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) return JSON.parse(saved);
            } catch  {
            // ignore
            }
            // Start unauthenticated so landing page shows fresh sign-in experience
            return null;
        }
    }["AuthProvider.useState"]);
    const [authModalOpen, setAuthModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [authModalMode, setAuthModalMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('signin');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            if (user) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }["AuthProvider.useEffect"], [
        user
    ]);
    const openAuthModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[openAuthModal]": (mode = 'signin')=>{
            setAuthModalMode(mode);
            setAuthModalOpen(true);
        }
    }["AuthProvider.useCallback[openAuthModal]"], []);
    const closeAuthModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[closeAuthModal]": ()=>{
            setAuthModalOpen(false);
        }
    }["AuthProvider.useCallback[closeAuthModal]"], []);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[login]": async (email, password)=>{
            const cleanEmail = email.trim().toLowerCase();
            let registeredUsers = {};
            try {
                const stored = localStorage.getItem(USERS_STORAGE_KEY);
                if (stored) registeredUsers = JSON.parse(stored);
            } catch  {
                registeredUsers = {};
            }
            const existing = registeredUsers[cleanEmail];
            if (existing) {
                if (existing.password && password && existing.password !== password) {
                    throw new Error('Invalid password. Please check your credentials and try again.');
                }
                const userProfile = {
                    id: existing.id,
                    name: existing.name,
                    email: existing.email,
                    role: existing.role,
                    company: existing.company || 'Retail Enterprise',
                    joinedAt: existing.joinedAt
                };
                setUser(userProfile);
                setAuthModalOpen(false);
                return true;
            }
            // Provision new user session for valid credentials
            const namePart = email.split('@')[0] || 'Analyst';
            const formattedName = namePart.split(/[._-]/).filter(Boolean).map({
                "AuthProvider.useCallback[login]": (part)=>part.charAt(0).toUpperCase() + part.slice(1)
            }["AuthProvider.useCallback[login]"]).join(' ') || 'Retail Analyst';
            const authenticatedUser = {
                id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
                name: formattedName,
                email: email.trim(),
                role: 'Business Intelligence Analyst',
                company: 'Enterprise Retail Operations',
                joinedAt: new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                })
            };
            registeredUsers[cleanEmail] = {
                ...authenticatedUser,
                password: password || ''
            };
            try {
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
            } catch  {
            // ignore
            }
            setUser(authenticatedUser);
            setAuthModalOpen(false);
            return true;
        }
    }["AuthProvider.useCallback[login]"], []);
    const signup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[signup]": async (name, email, password, company)=>{
            const cleanEmail = email.trim().toLowerCase();
            let registeredUsers = {};
            try {
                const stored = localStorage.getItem(USERS_STORAGE_KEY);
                if (stored) registeredUsers = JSON.parse(stored);
            } catch  {
                registeredUsers = {};
            }
            if (registeredUsers[cleanEmail]) {
                throw new Error('An account with this email address already exists. Please sign in instead.');
            }
            const newAccount = {
                id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
                name: name.trim(),
                email: email.trim(),
                password: password || '',
                role: 'Enterprise Business Analyst',
                company: company?.trim() || 'Retail Enterprise',
                joinedAt: new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                })
            };
            registeredUsers[cleanEmail] = newAccount;
            try {
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
            } catch  {
            // ignore
            }
            // Direct back to sign in (do NOT auto-login user on signup)
            return true;
        }
    }["AuthProvider.useCallback[signup]"], []);
    const loginAsDemo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[loginAsDemo]": (type)=>{
            setUser(DEMO_PROFILES[type]);
            setAuthModalOpen(false);
        }
    }["AuthProvider.useCallback[loginAsDemo]"], []);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[logout]": ()=>{
            setUser(null);
        }
    }["AuthProvider.useCallback[logout]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isAuthenticated: !!user,
            login,
            signup,
            loginAsDemo,
            logout,
            openAuthModal,
            closeAuthModal,
            authModalOpen,
            authModalMode
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/AuthContext.tsx",
        lineNumber: 242,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AuthProvider, "DtEzCBCLBj3gGFTY2/tQKoNs6Qg=");
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/DataContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DataProvider",
    ()=>DataProvider,
    "useData",
    ()=>useData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
const DataContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const THEME_TRANSITION_MS = 350;
const DataProvider = ({ children })=>{
    _s();
    const [dataset, setDataset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [backendUp, setBackendUp] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [refreshing, setRefreshing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [version, setVersion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // Initialize theme with safe localStorage and fallback to system preference
    const [theme, setThemeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "DataProvider.useState": ()=>{
            try {
                const saved = localStorage.getItem('abip_theme');
                if (saved === 'dark' || saved === 'light') return saved;
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return 'dark';
                }
            } catch  {
            // fallback
            }
            return 'dark';
        }
    }["DataProvider.useState"]);
    // Tracks the last applied theme so we only animate on real changes (not on first mount)
    const prevTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const transitionTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const applyTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataProvider.useCallback[applyTheme]": (mode, animate)=>{
            const root = document.documentElement;
            if (animate) {
                // Temporarily enable color transitions (see .theme-transition in globals.css)
                root.classList.add('theme-transition');
                if (transitionTimer.current !== null) {
                    window.clearTimeout(transitionTimer.current);
                }
                transitionTimer.current = window.setTimeout({
                    "DataProvider.useCallback[applyTheme]": ()=>{
                        root.classList.remove('theme-transition');
                        transitionTimer.current = null;
                    }
                }["DataProvider.useCallback[applyTheme]"], THEME_TRANSITION_MS);
            }
            root.classList.toggle('dark', mode === 'dark');
            root.style.colorScheme = mode;
            try {
                localStorage.setItem('abip_theme', mode);
            } catch  {
            // ignore
            }
        }
    }["DataProvider.useCallback[applyTheme]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataProvider.useEffect": ()=>{
            const animate = prevTheme.current !== null && prevTheme.current !== theme;
            applyTheme(theme, animate);
            prevTheme.current = theme;
        }
    }["DataProvider.useEffect"], [
        theme,
        applyTheme
    ]);
    // Clean up any pending timer on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataProvider.useEffect": ()=>{
            return ({
                "DataProvider.useEffect": ()=>{
                    if (transitionTimer.current !== null) {
                        window.clearTimeout(transitionTimer.current);
                    }
                }
            })["DataProvider.useEffect"];
        }
    }["DataProvider.useEffect"], []);
    const setTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataProvider.useCallback[setTheme]": (mode)=>{
            setThemeState(mode);
        }
    }["DataProvider.useCallback[setTheme]"], []);
    const toggleTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataProvider.useCallback[toggleTheme]": ()=>{
            setThemeState({
                "DataProvider.useCallback[toggleTheme]": (prev)=>prev === 'dark' ? 'light' : 'dark'
            }["DataProvider.useCallback[toggleTheme]"]);
        }
    }["DataProvider.useCallback[toggleTheme]"], []);
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataProvider.useCallback[load]": async (bump = false)=>{
            setRefreshing(true);
            try {
                const res = await fetch('/api/data/status');
                if (res.ok) {
                    const data = await res.json();
                    setDataset(data.database_exists && (data.total_rows || 0) > 0 ? data : null);
                    setBackendUp(true);
                } else {
                    setDataset(null);
                }
            } catch (e) {
                console.warn('Backend not reachable:', e);
                setDataset(null);
                setBackendUp(false);
            } finally{
                setRefreshing(false);
                setReady(true);
                if (bump) setVersion({
                    "DataProvider.useCallback[load]": (v)=>v + 1
                }["DataProvider.useCallback[load]"]);
            }
        }
    }["DataProvider.useCallback[load]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataProvider.useEffect": ()=>{
            load(false);
        }
    }["DataProvider.useEffect"], [
        load
    ]);
    const refresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataProvider.useCallback[refresh]": async ()=>{
            await load(true);
        }
    }["DataProvider.useCallback[refresh]"], [
        load
    ]);
    const uploadFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataProvider.useCallback[uploadFile]": async (file)=>{
            const form = new FormData();
            form.append('file', file);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: form
            });
            if (!res.ok) {
                const body = await res.json().catch({
                    "DataProvider.useCallback[uploadFile]": ()=>({})
                }["DataProvider.useCallback[uploadFile]"]);
                throw new Error(body.detail || 'Upload failed.');
            }
            const data = await res.json();
            await load(true);
            return data;
        }
    }["DataProvider.useCallback[uploadFile]"], [
        load
    ]);
    const loadSample = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataProvider.useCallback[loadSample]": async ()=>{
            const res = await fetch('/api/data/sample', {
                method: 'POST'
            });
            if (!res.ok) {
                const body = await res.json().catch({
                    "DataProvider.useCallback[loadSample]": ()=>({})
                }["DataProvider.useCallback[loadSample]"]);
                throw new Error(body.detail || 'Could not load sample dataset.');
            }
            const data = await res.json();
            await load(true);
            return data;
        }
    }["DataProvider.useCallback[loadSample]"], [
        load
    ]);
    const removeData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataProvider.useCallback[removeData]": async ()=>{
            const res = await fetch('/api/data', {
                method: 'DELETE'
            });
            if (!res.ok) {
                const body = await res.json().catch({
                    "DataProvider.useCallback[removeData]": ()=>({})
                }["DataProvider.useCallback[removeData]"]);
                throw new Error(body.detail || 'Could not remove data.');
            }
            const data = await res.json();
            await load(true);
            return data;
        }
    }["DataProvider.useCallback[removeData]"], [
        load
    ]);
    const downloadTemplate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataProvider.useCallback[downloadTemplate]": ()=>{
            window.location.href = '/api/data/template';
        }
    }["DataProvider.useCallback[downloadTemplate]"], []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DataProvider.useMemo[value]": ()=>({
                dataset,
                loaded: Boolean(dataset && dataset.database_exists && (dataset.total_rows || 0) > 0),
                filename: dataset?.filename || '',
                ready,
                backendUp,
                refreshing,
                version,
                theme,
                setTheme,
                toggleTheme,
                refresh,
                uploadFile,
                loadSample,
                removeData,
                downloadTemplate
            })
    }["DataProvider.useMemo[value]"], [
        dataset,
        ready,
        backendUp,
        refreshing,
        version,
        theme,
        setTheme,
        toggleTheme,
        refresh,
        uploadFile,
        loadSample,
        removeData,
        downloadTemplate
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DataContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/DataContext.tsx",
        lineNumber: 221,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_s(DataProvider, "7QmaPhwG+aqj8DKDkiPsvsa11nU=");
_c = DataProvider;
const useData = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
_s1(useData, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "DataProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]})(),
"[project]/src/App.tsx [app-client] (ecmascript, next/dynamic entry)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/App.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_1o5hhogpup1zu._.js.map