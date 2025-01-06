import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import Container from './Container';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-secondary mt-auto border-t">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
                    {/* About section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">О компании</h3>
                        <p className="text-sm text-muted-foreground">
                            Online Booking - ваш надежный партнер в мире путешествий.
                            Мы предлагаем лучшие отели и сервис бронирования для вашего
                            идеального отдыха.
                        </p>
                    </div>

                    {/* Contact section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Контакты</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center">
                                <Phone className="h-4 w-4 mr-2" />
                                <a href="tel:+78001234567" className="hover:underline">
                                    8 (800) 123-45-67
                                </a>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-4 w-4 mr-2" />
                                <a href="mailto:info@onlinebooking.com" className="hover:underline">
                                    info@onlinebooking.com
                                </a>
                            </li>
                            <li className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>Москва, ул. Примерная, д. 1</span>
                            </li>
                        </ul>
                    </div>

                    {/* Quick links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Быстрые ссылки</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/about" className="hover:underline">
                                    О нас
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:underline">
                                    Условия использования
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:underline">
                                    Политика конфиденциальности
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:underline">
                                    Часто задаваемые вопросы
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social media */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Мы в соцсетях</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-primary transition-colors">
                                <Facebook className="h-6 w-6" />
                            </a>
                            <a href="#" className="hover:text-primary transition-colors">
                                <Instagram className="h-6 w-6" />
                            </a>
                            <a href="#" className="hover:text-primary transition-colors">
                                <Twitter className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t py-6">
                    <p className="text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Online Booking. Все права защищены.
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;