import useMediaQuery from "@mui/material/useMediaQuery";
import style from "./MainLayout.module.scss";
import {useTheme} from "@mui/material";
import {Header} from "@/components/Layout/Header/Header";

export const MainLayout = ({children}: any) => {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

    return (
        <div className={style.MainLayout}>
            <Header
                className={style.Header}
                theme={theme}
                isLargeScreen={isLargeScreen}
            />
            <div className={style.Main}>
                <div className={style.MainWrapper}>
                    <div className={style.MonitorFrame}></div>
                    <div className={style.MonitorContent}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
